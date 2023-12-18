import React, { Fragment, useState, useEffect } from "react";

import { Printer} from "react-feather";
import { useNavigate } from 'react-router-dom'

import {
	Row,
	CardHeader,
	Card,
	CardTitle,
	Button,
	Col,
	Label,
} from "reactstrap";

import DataTable from "react-data-table-component";
import Select from 'react-select'
import { ReactSelectStyles } from "@utils"

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import { useTranslation } from "react-i18next";
import classnames from "classnames";

import { getPagination, monthsOption } from "@utils";

import { getColumns, getColumnsDetail } from "./helpers";

export function ExpandedComponent({ data })
{

    const tableCustomStyles = {
        headCells: {
          style: {
            backgroundColor: '#9CD9F3'
          },
        },
      }

    return (
        <Card className='mb-0 rounded-0 border-bottom px-2 pb-1'>
            <div className='react-dataTable react-dataTable-selectable-rows mt-1'>
                <DataTable
                    noHeader
                    responsive
                    className='react-dataTable'
                    noDataComponent={(
                        <div className="my-2">
                            <h5>{'Өгөгдөл байхгүй байна'}</h5>
                        </div>
                    )}
                    highlightOnHover={true}
                    data={data?.datas}
                    columns={getColumnsDetail()}
                    customStyles={tableCustomStyles}
                    fixedHeader
                    fixedHeaderScrollHeight='62vh'
                />
            </div>
        </Card>
    )
}

const PartTime = () => {

    const date = new Date()
    const month = date.getMonth() + 1

	const { t } = useTranslation();
    const navigate = useNavigate();

	const [datas, setDatas] = useState([]);
    const [month_option] = useState(monthsOption)

	const [currentPage, setCurrentPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(10);

    const [selected_mount, setSelectedMounts] = useState(month_option.filter((e) => e.id === month))

	// Нийт датаны тоо
	const [total_count, setTotalCount] = useState(0);

	// Loader
	const { isLoading, fetchData, Loader } = useLoader({});

	// API
    const partTimeApi = useApi().credit.parttime

	async function getDatas() {
        var mount_ids = []
        if (selected_mount.length > 0) {
            mount_ids = selected_mount.map((e) => e.id)
        }

		const { success, data } = await fetchData(partTimeApi.get(rowsPerPage, currentPage, mount_ids));
		if (success) {
			setDatas(data?.results);
			setTotalCount(data?.count);
		}
	}

	// Хуудас солих үед ажиллах хэсэг
	const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	};

	useEffect(
        () =>
        {
		    getDatas();
        },
        [currentPage, rowsPerPage, selected_mount]
    );

    function printNavigate()
    {
        var mount_ids = []
        if (selected_mount.length > 0) {
            mount_ids = selected_mount.map((e) => e.id)
        }
        let printDatas = {
            months: mount_ids,
            datas: datas
        }

        navigate('/credit/part-time/print', { state: printDatas });
    }

	return (
		<Fragment>
            {isLoading && Loader}
			<Card>
				<CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4">{t(`${month} сарын цагийн багш нарын цагийн тооцооны нэгтгэл`)}</CardTitle>
                </CardHeader>
                <Row className="mx-0 mt-1">
                    <Col md={4} className='mb-1'>
						<Label className= "form-label me-1" for="month">
							{t('Сараар')}
						</Label>
                        <Select
                            name="month"
                            id="month"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            placeholder={t(`-- Сонгоно уу --`)}
                            options={month_option || []}
                            value={selected_mount}
                            noOptionsMessage={() => t('Хоосон байна')}
                            styles={ReactSelectStyles}
                            onChange={(val) => {
                                setSelectedMounts(val)
                            }}
                            isMulti
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                        />
					</Col>
                    <Col md={4} className='mt-2' >
                        <Button size="sm" color="primary" onClick={printNavigate}>
                            <Printer size={14} className='me-1'/>
                            Хэвлэх
                        </Button>
                    </Col>
                </Row>
                <div className='react-dataTable react-dataTable-selectable-rows mx-1'>
                    <DataTable
                        noHeader
                        pagination
                        paginationServer
                        className='react-dataTable'
                        progressPending={isLoading}
                        progressComponent={<h5>{'Түр хүлээнэ үү'}...</h5>}
                        noDataComponent={(
                            <div className="my-2">
                                <h5>{'Өгөгдөл байхгүй байна'}</h5>
                            </div>
                        )}
                        columns={getColumns(currentPage, rowsPerPage, total_count)}
                        data={datas}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                        expandableRows
                        expandableRowsComponent={ExpandedComponent}
                    />
                </div>
            </Card>
        </Fragment>
	);
};

export default PartTime;


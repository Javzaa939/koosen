import React, { Fragment, useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { getColumns } from "./helpers";
import { getPagination } from "@utils";

import {
    Row,
    Card,
    CardHeader,
    CardBody,
    CardTitle,
    Col,
} from "reactstrap";

import DataTable from "react-data-table-component";
import useLoader from "@hooks/useLoader";
import useApi from "@hooks/useApi";

const customStyles = {
    header: {
        style: {
        },
    },
    headRow: {
        style: {
            color: "#6e6b7b",
            fontWeight: "500",
            backgroundColor: "#f3f2f7"
        },
    },
    headCells: {
        style: {
            paddingLeft: '8px',
            paddingRight: '8px',
            whiteSpace: "none",
        },
    },
    rows: {
        style: {
            color: "#6e6b7b"
        },
    },
    cells: {
        style: {
            paddingLeft: '0px',
            paddingRight: '0px',
        },
    },
};

function Topic(props) {
    const { lessonId, lessonName } = props
    const { lesson_id } = useParams();

    const { t } = useTranslation();
    const { isLoading, fetchData } = useLoader({});
    const [datas, setDatas] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [total_count, setTotalCount] = useState(1);

    //API
    const api = useApi().teacher.lesson

    async function getDatas(id) {
        if (id) {
            const { success, data } = await fetchData(api.getLessonTopics(currentPage, rowsPerPage, id));
            if (success) {
                setDatas(data?.results);
            }
        }
    }

    useEffect(() => {
        getDatas(lessonId)
    }, [currentPage, rowsPerPage, lessonId]);

    const handlePagination = (page) => {
        setCurrentPage(page.selected);
    };

    function handleEdit(row) {
    }

    return (
        <Fragment>
            <Card className="m-0 ">
                <CardHeader className="py-1">
                    <CardTitle tag={'h5'}>
                        Хичээлийн сэдэв
                    </CardTitle>
                    <span style={{}}>
                        {lessonName ? `(${lessonName})` : ''}
                    </span>
                </CardHeader>
                <CardBody className="p-0">
                    <div className=''>
                        <DataTable
                            noHeader
                            pagination
                            paginationServer
                            // className='react-dataTable'
                            progressPending={isLoading}
                            progressComponent={<h5>{t('Түр хүлээнэ үү...')}</h5>}
                            noDataComponent={(
                                <div className="my-2">
                                    <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                                </div>
                            )}
                            customStyles={customStyles}
                            columns={getColumns(currentPage, rowsPerPage, total_count, handleEdit)}
                            paginationPerPage={rowsPerPage}
                            paginationDefaultPage={currentPage}
                            paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                            data={datas}
                            fixedHeader
                            fixedHeaderScrollHeight='62vh'
                        />
                    </div>
                </CardBody>
            </Card>
        </Fragment>
    )
} export default Topic;
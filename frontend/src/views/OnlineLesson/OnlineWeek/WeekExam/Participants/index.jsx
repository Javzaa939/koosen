import React, {Fragment, useState, useEffect} from "react";
import {useTranslation} from "react-i18next";
import {getPagination} from "@utils";
import {getColumns} from "./helpers";
import {useParams} from "react-router-dom";
import {Search} from "react-feather";

import {
    Row,
	Col,
	Card,
	Input,
    Label,
	Button,
	CardTitle,
	CardHeader,
} from "reactstrap";

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import DataTable from "react-data-table-component";
import BreadCrumbs from '@components/breadcrumbs';
import ResultModal from "./Modal";

function Participants(){

	const { t } = useTranslation();

    const { isLoading, fetchData } = useLoader({});
    const { challenge_id } = useParams();

    // Pagination and Sort states
    const defaultPage = [10, 15, 50, 75, 100];
    const [currentPage, setCurrentPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(10);
    const [total_count, setTotalCount] = useState(1);
    const [searchValue, setSearchValue] = useState('');

    const [datas, setDatas] = useState([]);


    // row modal
    const [modal, setModal] = useState(false);
    const [modalId, setModalId] = useState();
    const [modalData, setModalData] = useState([]);


    const challengeAPI = useApi().challenge.psychologicalTestResult;

    async function getDatas(){
        const { success, data } = await fetchData(challengeAPI.getParticipants(rowsPerPage, currentPage, searchValue, challenge_id));
        if (success) {
            setDatas(data?.results);
            setTotalCount(data?.count);
        }
    };

    useEffect(() => {
        getDatas()
    },[currentPage, rowsPerPage])


    function handleFilter(e){
        const value = e.target.value.trimStart();
        setSearchValue(value)
    };

    function handleSearch(){
		getDatas()
	};

    const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	};

    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    };

    function handleModal(id, data){
        setModal(!modal);
        setModalId(id);
        setModalData(data);
    }

    useEffect(() => {
        if (searchValue.length === 0) getDatas()
    },[searchValue])

    return(
        <Fragment>
            <Card md={12}>
                <Row className="mt-2 d-flex  flex-row align-items-center border-bottom m-1">
                    <BreadCrumbs
                        parentTitle={'Сэтгэлзүйн сорил'}
                        parentUrl={'/psychologicaltesting/exam'}
                        title={'Сэтгэлзүйн сорил'}
                        data={[
                            { title: 'Үр дүн', link: '/psychologicaltesting/result' },
                            { title: 'Элсэгч'},
                            { title: 'Сорил өгсөн оролцогчдын жагсаалт' }
                        ]}
                    />
                </Row>
                <Row className='justify-content-between mx-0 mb-1'>
                    <Col className='d-flex align-items-center justify-content-start '>
                        <Col md={2} sm={3} className='pe-1'>
                            <Input
                                className='dataTable-select me-1 mb-50'
                                type='select'
                                bsSize='sm'
                                style={{ height: "30px",}}
                                value={rowsPerPage}
                                onChange={e => handlePerPage(e)}
                            >
                                {
                                    defaultPage.map((page, idx) => (
                                    <option
                                        key={idx}
                                        value={page}
                                    >
                                        {page}
                                    </option>
                                ))}
                            </Input>
                        </Col>
                        <Col md={10} sm={3}>
                            <Label for='sort-select'>{t('Хуудсанд харуулах тоо')}</Label>
                        </Col>
                    </Col>
                    <Col className='mt-2 my-1 mx-1 d-flex align-items-center mobile-datatable-search'>
                        <Input
                            className='dataTable-filter mb-50'
                            type='text'
                            bsSize='sm'
                            id='search-input'
                            placeholder={t('Хайх')}
                            onChange={handleFilter}
                            onKeyPress={e => e.key === 'Enter' && handleSearch()}
                        />
                        <Button
                            size='sm'
                            className='ms-50 mb-50'
                            color='primary'
                            onClick={handleSearch}
                        >
                            <Search size={15} />
                            <span className='align-middle ms-50'></span>
                        </Button>
                    </Col>
                </Row>
                <div className="react-dataTable react-dataTable-selectable-rows">
					<DataTable
						noHeader
						pagination
						className="react-dataTable"
						progressPending={isLoading}
						progressComponent={
							<div className="my-2">
								<h5>{t("Түр хүлээнэ үү...")}</h5>
							</div>
						}
						noDataComponent={
							<div className="my-2">
								<h5>{t("Өгөгдөл байхгүй байна")}</h5>
							</div>
						}
						columns={getColumns(
							currentPage,
							rowsPerPage,
							total_count,
                            handleModal
						)}
						paginationPerPage={rowsPerPage}
						paginationDefaultPage={currentPage}
						data={datas}
						paginationComponent={getPagination(
                            handlePagination,
							currentPage,
							rowsPerPage,
							total_count,
						)}
						fixedHeader
						fixedHeaderScrollHeight="62vh"
					/>
				</div>
                {modal && <ResultModal open={modal} handleModal={handleModal} datas={modalData} />}
            </Card>
        </Fragment>
    )
}export default Participants;
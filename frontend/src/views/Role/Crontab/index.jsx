// ** React Imports
import { Fragment, useState, useEffect, useContext } from 'react'

import { Col, Card, Input, Button, CardTitle, CardHeader, Spinner } from 'reactstrap'

import { ChevronDown, Plus, Search } from 'react-feather'

import { useTranslation } from 'react-i18next'

import DataTable from 'react-data-table-component'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import AuthContext from "@context/AuthContext"

import { getPagination } from '@utils'

import CrontabAdd from './Add'

import { getColumns } from './helpers';

const Crontab = () => {

	const { t } = useTranslation()
	const { user } = useContext(AuthContext)

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10)

	const [searchValue, setSearchValue] = useState("");
	const [editData, setEditRowData] = useState({});

	const [datas, setDatas] = useState([]);

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)

	// Loader
	const { isLoading, fetchData } = useLoader({});

    const [update_modal, setUpdateModal] = useState(false)

    const crontabApi = useApi().role.crontab

	// Засах функц
    function handleUpdateModal(data={}) {
        setEditRowData(data)
        setUpdateModal(!update_modal)
    }

	/* Жагсаалтын дата авах функц */
	async function getDatas() {
		const { success, data } = await fetchData(crontabApi.get(currentPage, rowsPerPage, searchValue));

		if (success) {
			setDatas(data?.results);
			setTotalCount(data?.count);
		}
	}

	const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

    async function handleSearch() {
        if (searchValue.length > 0) getDatas()
    }

    // Устгах товч дарах үед ажиллах функц
    async function handleDelete(id) {
        const { success, data } = await fetchData(crontabApi.delete(id));
        if (success) {
            getDatas()
        }
    }

    // Хязгаарлах товч дарах үед ажиллах функц
    async function handleStop(cdata) {
        if (cdata?.is_active) {
            const { success } = await fetchData(crontabApi.limit(cdata?.id));
            if (success) {
                getDatas()
            }
        } else {
            const { success } = await fetchData(crontabApi.active(cdata?.id));
            if (success) {
                getDatas()
            }
        }
    }

	// Хуудас солих үед ажиллах хэсэг
	const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	};

	useEffect(
        () =>
        {
		    getDatas()
	    },
        []
    )

    // && user.permissions.includes('lms-settings-crontab-create') Эрх нэмэхээр шалгана
	return (
		<Fragment>
			<Card>
				<CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4">{t('Мэдэгдэл илгээх тохиргоо')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button disabled={Object.keys(user).length > 0  ? false : true} color='primary' onClick={() => handleUpdateModal()}>
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
                <Col className='d-flex align-items-end mobile-datatable-search me-1 mt-1 '>
                    <Input
                        className='dataTable-filter mb-50'
                        type='text'
                        bsSize='sm'
                        id='search-input'
                        placeholder={t("Хайх")}
                        value={searchValue}
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

				{isLoading
                ?
					<div className="my-2 text-center" sm={12}>
						<Spinner size='sm' />
						<span className='ms-50'>{t('Түр хүлээнэ үү')}...</span>
					</div>
                :
                    <div className="react-dataTable react-dataTable-selectable-rows">
                        <DataTable
                            noHeader
                            pagination
                            className='react-dataTable'
                            noDataComponent={(
                                <div className="my-2">
                                    <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                                </div>
                            )}
                            columns={getColumns(
                                currentPage,
                                rowsPerPage,
                                total_count,
                                handleUpdateModal,
                                user,
                                handleDelete,
                                handleStop
                            )}
                            sortIcon={<ChevronDown size={10} />}
                            paginationPerPage={rowsPerPage}
                            paginationDefaultPage={currentPage}
                            data={datas}
                            paginationComponent={getPagination(
                                handlePagination,
                                currentPage,
                                rowsPerPage,
                                total_count
                            )}
                            fixedHeader
                            fixedHeaderScrollHeight='62vh'
                        />
                    </div>
                }
				{update_modal && <CrontabAdd isOpen={update_modal} handleModal={handleUpdateModal} refreshDatas={getDatas} editData={editData}/>}
			</Card>
        </Fragment>
    )
}

export default Crontab;

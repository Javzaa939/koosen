import React, { useEffect, useState } from 'react'
import { Button, Spinner } from 'reactstrap'

import useLoader from '@hooks/useLoader';
import useApi from '@hooks/useApi';
import DataTable from 'react-data-table-component'
import { getPagination } from '@utils'

import { dataz } from './sampledata'
import { getColumns } from './helpers';
import { ChevronDown } from 'react-feather';
import EmailModal from './EmailModal';

function Email() {

    // const [datas, setDatas] = useState(1)

	const { isLoading, fetchData } = useLoader({});

	// const elseltApi = useApi().elselt.admissionuserdata.email

	// async function getDatas() {
    //     const {success, data} = await fetchData(elseltApi.get())
    //     if(success) {
    //         setDatas(data)
    //     }
	// }

    // useEffect(() => {
    //     getDatas()
    // }, [])

    // console.log(datas,'datas')

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10)

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')

    // Translate
    const default_page = [10, 20, 50, 75, 100]


	const [searchValue, setSearchValue] = useState("");
    const [join_year, setJoinYear] = useState('')

	const [datas, setDatas] = useState([]);
    const [ yearOption, setYear] = useState([])

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(dataz.length || 1)

    // Нийт хуудасны тоо
    const [pageCount, setPageCount] = useState(1)

    const [emailModal, setEmailModal] = useState(false)
    const [selectedEmail, setSelectedEmail] = useState('')

    // Хуудас солих үед ажиллах хэсэг
	function handlePagination(page) {
		setCurrentPage(page.selected + 1);
	};

    function handleSort(column, sort) {
        if(sort === 'asc') {
            setSort(column.header)
        } else {
            setSort('-' + column.header)
        }
    }

    function emailModalHandler(e, data) {
        setEmailModal(!emailModal);
        setSelectedEmail(data)
    }

    return (
        <div>
            <EmailModal emailModal={emailModal} emailModalHandler={emailModalHandler} selectedEmail={selectedEmail}/>
            <div className="react-dataTable react-dataTable-selectable-rows">
                <DataTable
                    noHeader
                    paginationServer
                    pagination
                    className='react-dataTable'
                    // progressPending={isLoading}
                    // progressComponent={
                    //     <div className='my-2 d-flex align-items-center justify-content-center'>
                    //         <Spinner className='me-1' color="" size='sm'/><h5>Түр хүлээнэ үү...</h5>
                    //     </div>
                    // }
                    noDataComponent={(
                        <div className="my-2">
                            <h5>Өгөгдөл байхгүй байна</h5>
                        </div>
                    )}
                    onSort={handleSort}
                    columns={getColumns(currentPage, rowsPerPage, pageCount, emailModalHandler, setSelectedEmail)}
                    sortIcon={<ChevronDown size={10} />}
                    paginationPerPage={rowsPerPage}
                    paginationDefaultPage={currentPage}
                    data={dataz}
                    paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                    fixedHeader
                    fixedHeaderScrollHeight='62vh'
                />
            </div>
        </div>
    )
}

export default Email

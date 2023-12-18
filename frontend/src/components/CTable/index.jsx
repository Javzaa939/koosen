import React, { useState, useEffect } from 'react'

import ReactPaginate from "react-paginate";

import { Table } from 'reactstrap'
import Header from './headers'
import CBody from './body'

import { Previous, Next } from '@utils'

/**
 * @param {array} headers Хүснэгтийн баганын нэр array
 * headers =
 * [
 *  {
 *     key: 'name',
 *     name: 'Нэр',
 *     edidatble: false // Засах эсэх'
 *     center: True // Багана голлох
 *     component : Component дамжуулна
 *  }
 * ]

*/

export default function CTable(props) {
    const {
        headers,
        rowsPerPage,
        cdatas,
        cpagination // Хуудаслалттай байх эсэх
    } = props

    const [ datas, setDatas ] = useState([])

    const [slice, setSlice] = useState([]);

    const [ pageCount, setPageCount ] = useState(1)
    const [ pagination, setPagination ] = useState(cpagination || true)

    // Хуудаслалтын анхны утга
    const [ currentPage, setCurrentPage ] = useState(1)

    const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	};

    // Хуудсанд харуулах өгөгдлийг бодох
    const sliceData = (data, page, rowsPerPage) => {
        return data.slice((page - 1) * rowsPerPage, page * rowsPerPage);
    };

    useEffect(() => {
        if (pagination) {
            const slice = sliceData(datas, currentPage, rowsPerPage);
            setSlice([...slice]);
        }
    }, [datas, currentPage, rowsPerPage]);


    useEffect(
        () =>
        {
            if (cdatas) {
                var page_count = Math.ceil(cdatas.length / rowsPerPage)
                setPageCount(page_count)
                setDatas(cdatas)
            }

            if (cpagination !== undefined) {
                setPagination(cpagination)
            }

        },
        [cdatas]
    )

    return (
        <div className='m-1'>
            <Table size='sm' responsive>
                <Header headers={headers}/>
                <CBody
                    datas={pagination ? slice : datas}
                    currentPage={currentPage}
                    pagination={pagination}
                    {...props}
                />
            </Table>
            {
                pagination &&
                    <ReactPaginate
                        previousLabel={<Previous size={15} />}
                        nextLabel={<Next size={15} />}
                        forcePage={(currentPage > pageCount) ? 0 : (currentPage !== 0 ? currentPage - 1 : 0)}
                        onPageChange={(page) => {
                            handlePagination(page)
                        }}
                        pageCount={pageCount || 1}
                        breakLabel={'...'}
                        pageRangeDisplayed={2}
                        marginPagesDisplayed={2}
                        activeClassName='active'
                        pageClassName='page-item'
                        nextLinkClassName='page-link'
                        nextClassName='page-item next'
                        previousClassName='page-item prev'
                        previousLinkClassName='page-link'
                        pageLinkClassName='page-link'
                        breakClassName='page-item'
                        breakLinkClassName='page-link'
                        containerClassName='pagination react-paginate pagination-sm justify-content-end pe-1 mt-1'
                    />
            }
        </div>
    )
}

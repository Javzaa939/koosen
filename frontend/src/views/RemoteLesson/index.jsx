import React, { useEffect, useState } from 'react'
import { Plus, Search } from 'react-feather'
import { Badge, Button, Card, CardBody, CardTitle, Input, PopoverBody, PopoverHeader, UncontrolledPopover } from 'reactstrap'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import './style.scss'
// import { sample } from './asd'
import { CiUser } from "react-icons/ci";
import { FaAngleDoubleRight } from "react-icons/fa";
import Add from './Add'
import { getPagination } from '@utils'
import { PiExam } from "react-icons/pi";
import { PiCertificate } from "react-icons/pi";

function RemoteLesson() {
    // const datas = sample
    const [ datas, setDatas ] = useState([])

    const [addModal, setAddModal] = useState(false)

    // Хуудаслалтын анхны утга
    const [currentPage, setCurrentPage] = useState(1)

    // Нэг хуудсанд харуулах нийт датаны тоо
    const [rowsPerPage, setRowsPerPage] = useState(6)

    // Хайлт хийхэд ажиллах хувьсагч
    const [searchValue, setSearchValue] = useState('')

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')

    function toggleAddModal() {
        setAddModal(!addModal)
    }

    const { isLoading, fetchData, Loader } = useLoader({isSmall: true});

    const remoteApi = useApi().remote

    async function getDatas() {
        const { success, data } = await fetchData(remoteApi.get(rowsPerPage, currentPage, searchValue));
        if (success) {
            setTotalCount(data?.count)
            setDatas(data?.results)
        }
    }

    const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

    useEffect(() => {
        getDatas();
    }, [currentPage]);

    // Хуудас солих үед ажиллах хэсэг
	function handlePagination(page) {
		setCurrentPage(page.selected + 1);
	}

    const Pagination = getPagination(
        handlePagination,
        currentPage,
        rowsPerPage,
        total_count,
        searchValue,
        '',
        ''
    )

    // Хайх товч дарсан үед ажиллах функц
    async function handleSearch() {
        getDatas()
    }

    return (
        <div>
            <Add isOpen={addModal} handleModal={toggleAddModal} refreshDatas={getDatas}/>
            <Card className='p-1 mb-1'>
                <CardTitle>Зайн сургалт</CardTitle>
                <CardBody className='d-flex justify-content-between align-items-center'>
                    <div>
                        {/* filters */}
                    </div>
                    <Button color='primary' onClick={() => toggleAddModal()}><Plus size={14}/> Үүсгэх</Button>
                </CardBody>
            </Card>
            <div className='d-flex justify-content-between align-items-center mb-1'>
                <div className='d-flex'>
                    <Input
                        className='dataTable-filter mb-50'
                        type='text'
                        bsSize='sm'
                        id='search-input'
                        placeholder={("Хайх")}
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
                </div>
                <Pagination/>
            </div>
            {
                isLoading ?
                    <div className='d-flex justify-content-center align-items-center py-2'>
                        {Loader}
                    </div>
                :
                    <div className='d-flex flex-wrap gap-1 justify-content-center'>
                        {datas.map((data, idx) => (
                            <div className='lesson_card d-flex flex-wrap align-items-between align-content-between p-2 shadow-sm' key={idx} style={{ overflow:'hidden' }}>
                                <div className='w-100'>
                                    <div className='fw-bold text-center'>
                                        {data?.title || ''}
                                    </div>
                                    <div className='d-flex justify-content-between mt-1'>
                                        <div>
                                            Багш: <span className='text-decoration-underline' id={`teacher_${idx}`} style={{ cursor: 'help' }}>{data?.teacher_info?.full_name}</span>
                                            <UncontrolledPopover
                                                placement="bottom"
                                                trigger="legacy"
                                                target={`teacher_${idx}`}
                                            >
                                                <PopoverHeader>
                                                    Багшийн мэдээлэл
                                                </PopoverHeader>
                                                <PopoverBody>
                                                    <div>
                                                        <div style={{ fontSize: 12 }}>{data?.teacher_info?.sub_org?.name}</div>
                                                        <b>
                                                            {data?.teacher_info?.last_name} {data?.teacher_info?.first_name}
                                                        </b>
                                                    </div>
                                                </PopoverBody>
                                            </UncontrolledPopover>
                                        </div>
                                        <div className='d-flex gap-25'>
                                            <Badge color='primary' pill title='Оюутны тоо' className='d-flex align-items-center gap-25'>
                                                <CiUser style={{ width: "12px", height: "12px" }}/> {data?.students?.length || 0}
                                            </Badge>
                                            <Badge color={data?.is_end_exam ? `light-success` : 'light-secondary'} pill title={data?.is_end_exam ? 'Төгсөлтийн шалгалттай' : 'Төгсөлтийн шалгалтгүй'} className='d-flex align-items-center gap-25'>
                                                <PiExam style={{ width: "24px", height: "24px" }}/>
                                            </Badge>
                                            <Badge color={data?.is_certificate ? `light-danger` : 'light-secondary'} pill title={data?.is_certificate ? 'Сертификаттай' : 'Сертификатгүй'} className='d-flex align-items-center gap-25'>
                                                <PiCertificate style={{ width: "24px", height: "24px" }}/>
                                            </Badge>
                                        </div>
                                    </div>
                                    <img
                                        src={data?.image}
                                        alt='image'
                                        className='mt-1'
                                        style={{ height: '200px', width: '100%', objectFit: 'cover', borderRadius: 5 }}
                                    />
                                </div>
                                <div className='d-flex justify-content-between mt-1'>
                                    <div></div>
                                    <a href={`/remote_lesson/${data?.id}`} className='d-flex align-items-center gap-25 pe-50 fw-bold text-decoration-underline'>Дэлгэрэнгүй <FaAngleDoubleRight/></a>
                                </div>
                            </div>
                        ))}
                    </div>
            }
        </div>
    )
}

export default RemoteLesson

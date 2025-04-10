import { useEffect, useState } from 'react';
import { Plus, Search } from 'react-feather';
import { CiUser } from "react-icons/ci";
import { FaAngleDoubleRight } from "react-icons/fa";
import { PiCertificate, PiExam } from "react-icons/pi";
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, Col, Input, PopoverBody, PopoverHeader, Progress, Row, UncontrolledPopover } from 'reactstrap';
import { Link } from 'react-router-dom';

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import { getPagination } from '@utils';
import empty from "@src/assets/images/empty-image.jpg";

import Addmodal from './components/Add';
import './style.scss';
import DisplayQuill from './components/DisplayQuill';

function RemoteLesson() {
    // const datas = sample
    const [datas, setDatas] = useState([])

    const [addModal, setAddModal] = useState(false)

    // Хуудаслалтын анхны утга
    const [currentPage, setCurrentPage] = useState(1)

    // Нэг хуудсанд харуулах нийт датаны тоо
    const [rowsPerPage, setRowsPerPage] = useState(8)

    // Хайлт хийхэд ажиллах хувьсагч
    const [searchValue, setSearchValue] = useState('')

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')

    function toggleAddModal() {
        setAddModal(!addModal)
    }

    const { isLoading, fetchData, Loader } = useLoader({ isSmall: true });

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
        <>
            <Addmodal
                open={addModal}
                handleModal={toggleAddModal}
                refreshDatas={getDatas}
            />
            <Card>
                <CardHeader>
                    <CardTitle>Зайн сургалт</CardTitle>
                    <Button color='primary' onClick={() => toggleAddModal()}><Plus size={14} /> Үүсгэх</Button>
                </CardHeader>
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
                <Pagination />
            </div>
            {
                isLoading ?
                    <div className='d-flex justify-content-center align-items-center py-2'>
                        {Loader}
                    </div>
                    :
                    <Row className='gy-6 mb-6'>
                        {datas.map((data, idx) => {
                            const { id, title, teacher_info, students, is_end_exam, is_certificate, image: imageOriginal, description } = data
                            const image = imageOriginal || empty
                            return (
                                <Col sm={6} lg={3} key={idx} className='m-0 p-50'>
                                    <Card className="p-50 h-100 shadow-none border bg-white">
                                        {
                                            imageOriginal
                                            &&
                                            <div className="rounded-2 text-center mb-1">
                                                <img className="img-fluid" src={image} alt={title}
                                                    onError={({ currentTarget }) => {
                                                        currentTarget.onerror = null; // prevents looping
                                                        currentTarget.src = empty
                                                    }}
                                                />
                                            </div>
                                        }
                                        <CardBody className="p-1 pt-50 d-flex flex-column h-100">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <div>
                                                    Багш: <span className='text-decoration-underline' id={`teacher_${idx}`} style={{ cursor: 'help' }}>{teacher_info?.full_name}</span>
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
                                                                <div style={{ fontSize: 12 }}>{teacher_info?.sub_org?.name}</div>
                                                                <b>
                                                                    {teacher_info?.last_name} {teacher_info?.first_name}
                                                                </b>
                                                            </div>
                                                        </PopoverBody>
                                                    </UncontrolledPopover>
                                                </div>
                                                <p className="d-flex align-items-center justify-content-center fw-medium gap-1 mb-0">
                                                    <Badge color={is_end_exam ? `light-success` : 'light-secondary'} pill title={is_end_exam ? 'Төгсөлтийн шалгалттай' : 'Төгсөлтийн шалгалтгүй'} className='d-flex align-items-center gap-25'>
                                                        <PiExam style={{ width: "24px", height: "24px" }} />
                                                    </Badge>
                                                    <Badge color={is_certificate ? `light-danger` : 'light-secondary'} pill title={is_certificate ? 'Сертификаттай' : 'Сертификатгүй'} className='d-flex align-items-center gap-25'>
                                                        <PiCertificate style={{ width: "24px", height: "24px" }} />
                                                    </Badge>
                                                </p>
                                            </div>
                                            <span className="h5">{title}</span>
                                            <p className="mt-25">
                                                <DisplayQuill content={description} />
                                            </p>
                                            <div className='mt-auto'>
                                                <p className="d-flex align-items-center mb-50">
                                                    <Badge color='primary' pill title='Оюутны тоо' className='d-flex align-items-center gap-25'>
                                                        <CiUser style={{ width: "12px", height: "12px" }} /> {students?.length || 0}
                                                    </Badge>
                                                </p>
                                                <Progress value={75} style={{ height: '8px' }} className="mb-1" />
                                                <div className='text-end'>
                                                    <Button
                                                        tag={Link}
                                                        to={`/remote_lesson/${id}`}
                                                        color="primary"
                                                        outline
                                                        className="btn-label-primary border"
                                                    >
                                                        <span className="me-50">Дэлгэрэнгүй</span> <FaAngleDoubleRight />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                </Col>
                            )
                        })}
                    </Row>
            }
        </>
    )
}

export default RemoteLesson

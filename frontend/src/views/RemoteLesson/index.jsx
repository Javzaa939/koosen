import { useEffect, useState } from 'react';
import { Edit, Plus, Search } from 'react-feather';
import { CiUser } from "react-icons/ci";
import { FaAngleDoubleRight } from "react-icons/fa";
import { PiCertificate, PiExam } from "react-icons/pi";
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, Col, Input, PopoverBody, PopoverHeader, Progress, Row, UncontrolledPopover, UncontrolledTooltip } from 'reactstrap';
import { Link } from 'react-router-dom';

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import { getPagination } from '@utils';

import AddEditModal from './components/AddEditModal';
import './style.scss';
import DisplayQuill from './components/DisplayQuill';

function RemoteLesson() {
    // const datas = sample
    const [datas, setDatas] = useState([])

    const [addEditModal, setAddEditModal] = useState(false)
    const [editData, setEditData] = useState()

    // Хуудаслалтын анхны утга
    const [currentPage, setCurrentPage] = useState(1)

    // Нэг хуудсанд харуулах нийт датаны тоо
    const [rowsPerPage, setRowsPerPage] = useState(8)

    // Хайлт хийхэд ажиллах хувьсагч
    const [searchValue, setSearchValue] = useState('')

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('-id')

    function toggleAddEditModal(data) {
        if (addEditModal) setEditData()
        else setEditData(data)

        setAddEditModal(!addEditModal)
    }

    const { isLoading, fetchData, Loader } = useLoader({ isSmall: true });

    const remoteApi = useApi().remote

    async function getDatas() {
        const { success, data } = await fetchData(remoteApi.get(rowsPerPage, currentPage, sortField, searchValue));

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
            {/* to reset modal values 'key' prop is used, because reset() function does not work sometimes I could not find reason */}
            <AddEditModal
                key={editData?.id}
                open={addEditModal}
                handleModal={toggleAddEditModal}
                refreshDatas={getDatas}
                editData={editData}
            />
            <Card>
                <CardHeader>
                    <CardTitle>Зайн сургалт</CardTitle>
                    <Button color='primary' onClick={() => toggleAddEditModal()}><Plus size={14} /> Үүсгэх</Button>
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
                            const { id, title, teacher_info, students, is_end_exam, is_certificate, description } = data

                            return (
                                <Col sm={6} lg={3} key={idx} className='m-0 p-50'>
                                    <Card className="p-50 h-100 shadow-none border bg-white">
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
                                                    {is_end_exam && <Badge color={`light-success`} pill title={'Төгсөлтийн шалгалттай'} className='d-flex align-items-center gap-25'>
                                                        <PiExam style={{ width: "24px", height: "24px" }} />
                                                    </Badge>}
                                                    {is_certificate && <Badge color={`light-danger`} pill title={'Сертификаттай'} className='d-flex align-items-center gap-25'>
                                                        <PiCertificate style={{ width: "24px", height: "24px" }} />
                                                    </Badge>}
                                                </p>
                                            </div>
                                            <span className="h5">{title}</span>
                                            <p className="mt-25">
                                                {description && <>
                                                    {/* to limit ELearn card-item height */}
                                                    <style>
                                                        {`
                                                            .custom-quill .ql-editor {
                                                                max-height: 130px;
                                                                overflow: hidden;
                                                            }
                                                        `}
                                                    </style>
                                                    <DisplayQuill
                                                        content={description}
                                                        className={'custom-quill'}
                                                    />
                                                </>}
                                            </p>
                                            <div className='mt-auto'>
                                                <p className="d-flex align-items-center mb-50">
                                                    <Badge color='primary' pill title='Оюутны тоо' className='d-flex align-items-center gap-25'>
                                                        <CiUser style={{ width: "12px", height: "12px" }} /> {students?.length || 0}
                                                    </Badge>
                                                </p>
                                                <Progress value={75} style={{ height: '8px' }} className="mb-1" />
                                                <div className='d-flex justify-content-between'>
                                                    <div>
                                                        <a
                                                            role="button"
                                                            onClick={() => toggleAddEditModal(data)}
                                                            id={`complaintListDatatableEdit${id}`}
                                                            className='me-1'
                                                        >
                                                            <Badge color="light-success"><Edit width={"10px"} /></Badge>
                                                        </a>
                                                        <UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${id}`} >Засах</UncontrolledTooltip>
                                                    </div>
                                                    <Button
                                                        tag={Link}
                                                        to={`/remote_lesson/${id}`}
                                                        color="primary"
                                                        outline
                                                        className="btn-label-primary border"
                                                        state={{ selectedELearn: data }}
                                                        size='sm'
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

import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'
import { useEffect, useState } from 'react'
import { ChevronsLeft } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { CiUser } from 'react-icons/ci'
import { PiCertificate, PiExam } from 'react-icons/pi'
import { useParams } from 'react-router-dom'
import { Badge, Card, CardBody, CardTitle, Col, Row } from 'reactstrap'
import GroupStudentBlock from '../components/GroupStudentBlock'
import StudentListBlock from '../components/StudentListBlock'
import OnlineInfoBlock from '../components/OnlineInfoBlock'
import OnlineSubInfoBlock from '../components/OnlineSubInfoBlock'

function Lesson() {
    const { id } = useParams()
    const { t } = useTranslation();
    const { isLoading, fetchData, Loader } = useLoader({ isFullScreen: true });
    const remoteApi = useApi().remote

    // #region to get Elearn basic data
    const [datas, setDatas] = useState()

    async function getDatas() {
        const { success, data } = await fetchData(remoteApi.getOne(id));
        if (success) {
            setDatas(data)
        }
    }

    useEffect(() => {
        getDatas();
    }, []);
    // #endregion

    // #region to paginate students in datatable
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [total_count, setTotalCount] = useState(1);

    const handlePagination = (page) => {
        setCurrentPage(page.selected + 1);
    }

    useEffect(() => {
        getStudentsDatas();
    }, [currentPage, rowsPerPage]);
    // #endregion

    // #region to search students using text input in datatable
    const [searchValue, setSearchValue] = useState('');

    useEffect(
        () => {
            if (searchValue.length === 0) {
                getStudentsDatas()
            }
        },
        [searchValue]
    )
    // #endregion

    // #region to get Elearn.students data
    const [studentsDatas, setStudentsDatas] = useState()

    const getStudentsDatas = async () => {
        const { success, data } = await fetchData(remoteApi.students.get({
            limit: rowsPerPage,
            page: currentPage,
            search: searchValue,
            elearnId: id,
        }));

        if (success) {
            setStudentsDatas(data?.results)
            setTotalCount(data?.count)
        }
    }
    // #endregion

    return (
        <>
            {isLoading && Loader}
            <a href='/remote_lesson' className='mb-1 fw-bold text-decoration-underline'><ChevronsLeft size={18} strokeWidth={2.5} /> {t('Буцах')}</a>
            <Row className='mt-2'>
                <Col>
                    <Card className='bg-white w-100'>
                        <CardBody>
                            <CardTitle tag="h4">{t("Сургалтын мэдээлэл")}</CardTitle>
                            <div>
                                <h2 className=''>{datas?.title}</h2>
                            </div>
                            <div>
                                <div className='d-flex justify-content-between'>
                                    <div>
                                        <div>
                                            <span>Эхлэх хугацаа: {datas?.start_date && new Date(datas?.start_date)?.toISOString()?.split('T')[0]}</span>
                                        </div>
                                        <div>
                                            <span>Дуусах хугацаа: {datas?.end_date && new Date(datas?.end_date)?.toISOString()?.split('T')[0]}</span>
                                        </div>
                                    </div>
                                    <div className='d-flex gap-25'>
                                        <Badge color='primary' pill title='Оюутны тоо' className='d-flex align-items-center gap-25'>
                                            <CiUser style={{ width: "12px", height: "12px" }} /> {datas?.students?.length || 0}
                                        </Badge>
                                        <Badge color={datas?.is_end_exam ? `light-success` : 'light-secondary'} pill title={datas?.is_end_exam ? 'Төгсөлтийн шалгалттай' : 'Төгсөлтийн шалгалтгүй'} className='d-flex align-items-center gap-25'>
                                            <PiExam style={{ width: "24px", height: "24px" }} />
                                        </Badge>
                                        <Badge color={datas?.is_certificate ? `light-danger` : 'light-secondary'} pill title={datas?.is_certificate ? 'Сертификаттай' : 'Сертификатгүй'} className='d-flex align-items-center gap-25'>
                                            <PiCertificate style={{ width: "24px", height: "24px" }} />
                                        </Badge>
                                    </div>
                                </div>
                                <img
                                    src={datas?.image}
                                    alt='image'
                                    className='mt-1'
                                    style={{ height: '300px', width: '100%', objectFit: 'cover', borderRadius: 5 }}
                                />
                            </div>
                        </CardBody>
                    </Card>
                </Col>
                <Col>
                    <GroupStudentBlock
                        elearnId={id}
                        remoteApi={remoteApi}
                        t={t}
                        refreshData={getStudentsDatas}
                    />
                </Col>
            </Row>
            <StudentListBlock
                t={t}
                datas={studentsDatas}
                getDatas={getStudentsDatas}
                setSearchValue={setSearchValue}
                currentPage={currentPage}
                rowsPerPage={rowsPerPage}
                total_count={total_count}
                handlePagination={handlePagination}
                fetchData={fetchData}
                remoteApi={remoteApi}
                elearnId={id}
            />
            <Row>
                <Col md={4}>
                    <OnlineInfoBlock
                        t={t}
                        datas={studentsDatas}
                        getDatas={getStudentsDatas}
                        fetchData={fetchData}
                        remoteApi={remoteApi}
                        elearnId={id}
                    />
                </Col>
                <Col md={8}>
                    <OnlineSubInfoBlock
                        t={t}
                        datas={studentsDatas}
                        getDatas={getStudentsDatas}
                        fetchData={fetchData}
                        remoteApi={remoteApi}
                        elearnId={id}
                    />
                </Col>
            </Row>
        </>
    )
}

export default Lesson

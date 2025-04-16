import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'
import { useEffect, useState } from 'react'
import { ChevronsLeft } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { CiUser } from 'react-icons/ci'
import { PiCertificate, PiExam } from 'react-icons/pi'
import { useLocation, useParams } from 'react-router-dom'
import { Badge, Card, CardBody, CardTitle, Col, Row } from 'reactstrap'
import GroupStudentBlock from '../components/GroupStudentBlock'
import StudentListBlock from '../components/StudentListBlock'
import OnlineInfoBlock from '../components/OnlineInfoBlock'
import useApiCustom from '../hooks/useApiCustom'
import OnlineSubInfoDetailsBlock from '../components/OnlineSubInfoDetailsBlock'

function Lesson() {
    // #region to paginate students in datatable
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [total_count, setTotalCount] = useState(1);

    const handlePagination = (page) => {
        setCurrentPage(page.selected + 1);
    }
    // #endregion

    // #region to search students using text input in datatable
    const [searchValue, setSearchValue] = useState('');

    useEffect(
        () => {
            if (searchValue.length === 0) {
                setRefreshStudents((current) => !current)
            }
        },
        [searchValue]
    )
    // #endregion

    const { id } = useParams()
    const remoteApi = useApi().remote

    // to get Elearn basic data
    const location = useLocation()
    const { selectedELearn } = location.state || {}
    const { title, students, start_date, end_date, is_end_exam, is_certificate } = selectedELearn || {}

    // #region API usage
    // #region to get Elearn's students data
    const [refreshStudents, setRefreshStudents] = useState(false)

    const getStudents = () => remoteApi.students.get({
        limit: rowsPerPage,
        page: currentPage,
        search: searchValue,
        elearnId: id,
        sort: 'id',
    })

    const { data: studentsDatasOriginal, isLoading: isLoadingStudents } = useApiCustom({
        apiFunction: getStudents,
        deps: [refreshStudents, currentPage, rowsPerPage]
    })

    const studentsDatas = studentsDatasOriginal?.results

    useEffect(() => {
        setTotalCount(studentsDatasOriginal?.count)
    }, [studentsDatasOriginal])
    // #endregion

    // #region to get OnlineInfo data
    const [refreshOnlineInfo, setRefreshOnlineInfo] = useState(false)

    const getOnlineInfo = () => remoteApi.onlineInfo.get({
        elearnId: id,
        sort: 'id',
    })

    const { data: onlineInfoDatas, isLoading: isLoadingOnlineInfo } = useApiCustom({
        apiFunction: getOnlineInfo,
        deps: [refreshOnlineInfo]
    })
    // #endregion

    // #region to get OnlineSubInfo data
    const [refreshOnlineSubInfo, setRefreshOnlineSubInfo] = useState(false)

    const getOnlineSubInfo = () => remoteApi.onlineSubInfo.get({
        elearnId: id,
        sort: 'id'
    })

    const { data: onlineSubInfoDatas, isLoading: isLoadingOnlineSubInfo } = useApiCustom({
        apiFunction: getOnlineSubInfo,
        deps: [refreshOnlineSubInfo]
    })
    // #endregion
    // #endregion API usage

    const { isLoading: isLoadingGeneral, Loader, fetchData } = useLoader({});
    const isLoading = isLoadingGeneral || isLoadingStudents || isLoadingOnlineInfo || isLoadingOnlineSubInfo

    const { t } = useTranslation();

    // #region to act on OnlineSubInfo select
    const [selectedOnlineSubInfo, setSelectedOnlineSubInfo] = useState()

    function handleSelectOnlineSubInfo(onlineSubInfoData, onlineInfoTitle) {
        setSelectedOnlineSubInfo({ onlineSubInfoData: onlineSubInfoData, onlineInfoTitle: onlineInfoTitle })
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
                                <h2 className=''>{title}</h2>
                            </div>
                            <div>
                                <div className='d-flex justify-content-between'>
                                    <div>
                                        <div>
                                            <span>Эхлэх хугацаа: {start_date && new Date(start_date)?.toISOString()?.split('T')[0]}</span>
                                        </div>
                                        <div>
                                            <span>Дуусах хугацаа: {end_date && new Date(end_date)?.toISOString()?.split('T')[0]}</span>
                                        </div>
                                    </div>
                                    <p className="d-flex align-items-center justify-content-center fw-medium gap-1 mb-0">
                                        <Badge color='primary' pill title='Оюутны тоо' className='d-flex align-items-center gap-25' style={{ height: "24px" }}>
                                            <CiUser style={{ width: "12px", height: "12px" }} /> {students?.length || 0}
                                        </Badge>
                                        {is_end_exam && <Badge color={`light-success`} pill title={'Төгсөлтийн шалгалттай'} className='d-flex align-items-center gap-25'>
                                            <PiExam style={{ width: "24px", height: "24px" }} />
                                        </Badge>}
                                        {is_certificate && <Badge color={`light-danger`} pill title={'Сертификаттай'} className='d-flex align-items-center gap-25'>
                                            <PiCertificate style={{ width: "24px", height: "24px" }} />
                                        </Badge>}
                                    </p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
                <Col>
                    <GroupStudentBlock
                        elearnId={id}
                        remoteApi={remoteApi}
                        t={t}
                        refreshData={() => setRefreshStudents((current) => !current)}
                    />
                </Col>
            </Row>
            <StudentListBlock
                t={t}
                datas={studentsDatas}
                getDatas={() => setRefreshStudents((current) => !current)}
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
                        datas={onlineInfoDatas}
                        getDatas={() => setRefreshOnlineInfo((current) => !current)}
                        onlineSubInfoDatas={onlineSubInfoDatas}
                        getOnlineSubInfoDatas={() => setRefreshOnlineSubInfo((current) => !current)}
                        elearnId={id}
                        handleSelectOnlineSubInfo={handleSelectOnlineSubInfo}
                        fetchData={fetchData}
                        remoteApi={remoteApi}
                    />
                </Col>
                <Col md={8}>
                    <OnlineSubInfoDetailsBlock
                        t={t}
                        selectedOnlineSubInfo={selectedOnlineSubInfo}
                    />
                </Col>
            </Row>
        </>
    )
}

export default Lesson

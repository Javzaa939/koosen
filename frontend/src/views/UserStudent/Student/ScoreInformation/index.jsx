import { useContext, Fragment, useState, useEffect } from "react"

import {
    Row,
    Col,
    Card,
    Spinner,
    CardTitle,
    CardHeader,
    Table,
} from 'reactstrap'
import CTable from "./Table"

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader'
import { useTranslation } from 'react-i18next'

import { AuthContext } from '@context/AuthContext'
import ActiveYearContext from '@context/ActiveYearContext'


const ScoreInformation = () => {

    const { t } = useTranslation()
    const default_page = [10, 15, 50, 75, 100]
    const { userDetail } = useContext(AuthContext)

    //useState
    const [studentDatas, setDatas]= useState([])
    const [sortField, setSort] = useState('')
    const [total_count, setTotalCount] = useState(1)
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const { Loader, isLoading, fetchData} = useLoader({})
    const { cyear, cseason_id } = useContext(ActiveYearContext)

    const [total_gpa, setTotalGpa] = useState(null);
    const [total_kr, setTotalkr] = useState(null);
    const [total_onoo, setTotalOnoo] = useState(null);
    const [assessmentCounts, setAssessmentCounts] = useState([]);

    const studentScoreApi = useApi().student.allscore;

    const [datas, setSeason] = useState([])

    // api
    const scoreInfApi = useApi().student.scoreregister

    async function getDatas() {
        const student_id = userDetail?.student?.id
        const { success, data } = await fetchData(scoreInfApi.get(student_id))
        if(success)
        {
            setSeason(data)
        }

    }

    const ScoreData = async () => {
        const { success, data } = await fetchData(studentScoreApi.get(userDetail?.student?.id));
        if (success) {
            setDatas(data);
            setTotalGpa(data.all_total[0]?.all_total?.total_gpa);
            setTotalkr(data.all_total[0]?.all_total?.total_kr);
            setTotalOnoo(data.all_total[0]?.all_total?.total_onoo);
            setAssessmentCounts(data.asses_count);
        }
    };


    useEffect(() => {
        getDatas();
        ScoreData();
    }, [])


    return (
        <Fragment>
            <Card>
                {isLoading && Loader}
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                    <CardTitle tag='h4'>{t('Дүнгийн мэдээлэл')}</CardTitle>
                </CardHeader>

                {datas && datas.length > 0 ? (
                    <>
                        <Row className="m-1">
                            <Col className="mb-2" md={12}>
                                {datas.map((data, idx) => (
                                    <div className='mb-3' key={idx}>
                                        <CTable
                                            data={data}
                                            title={data.year_season}
                                        />
                                    </div>
                                ))}
                                {total_kr && total_onoo && total_gpa && assessmentCounts.length > 0 && (
                                    <div className='mb-0'>
                                        <Table size='sm' bordered responsive>
                                            <tbody>
                                                <tr className="text-center">
                                                    <th>
                                                        Нийт Кредит: {total_kr} Дундаж дүн: {total_onoo} Голч: {total_gpa}
                                                    </th>
                                                    <th>[
                                                        {[...assessmentCounts.map((item, index) => (
                                                            `${item.assessment__assesment}: ${item.asses_count}`
                                                        ))].join(', ')}
                                                        ]
                                                    </th>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </div>
                                )}
                            </Col>
                        </Row>
                    </>
                ) : (
                    <div className="sc-dmctIk gLxfFK react-dataTable text-center">
                        <div className="sc-fLcnxK dApqnJ">
                            <div className="sc-bcXHqe kVrXuC rdt_Table" role="table">
                                <div className="sc-iveFHk bzRnkJ">
                                    <div className="my-2">
                                        <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Card>
        </Fragment>
    );
}
export default ScoreInformation

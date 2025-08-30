import { Fragment, useState, useContext, useEffect } from "react"

import { Card, CardTitle, CardHeader, CardBody, Row, Col } from 'reactstrap'

import { useTranslation } from 'react-i18next'

import TransactionHistory from "./TransactionHistory"
import SeasonPayment from "./SeasonPayment"

import { PaymentModal } from "@lms_components/PaymentModal"

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import AuthContext from '@context/AuthContext'
import { useQpay } from "@context/QpayContext"

import { FEE } from "@src/utility/consts"

import PaymentCard from "./PaymentCard"
import { useNavigate } from "react-router-dom"
import SmallPrintModal from "./SmallPrintModal"
import { FiAlertCircle } from "react-icons/fi"

const STUDY = 1

const PaymentInformation = () => {

    const { t } = useTranslation()
    const navigate = useNavigate()

    const [modal, setModal] = useState(false)
    const { userDetail } = useContext(AuthContext)
    const { setHandleAction } = useQpay() ?? {}

    const studentId = userDetail?.student?.id

    const { fetchData } = useLoader({})
    const { isLoading, Loader, fetchData: ebarimtFetchData } = useLoader({ isFullScreen: true })
    const { isLoading: qpayLoading, fetchData: qpayFetchData } = useLoader({ isFullScreen: true })

    const [datas, setDatas] = useState({})
    const [isKorea, setIsKorea] = useState(false)
    const [transactionDatas, setTransactionDatas] = useState([])
    const [estumateDatas, setEstimateDatas] = useState({})
    const [barimtDetailModal, setBarimtDetailModal] = useState(false)
    const [barimtDetailDatas, setBarimtDetailDatas] = useState([])

    // Api
    const qpayApi = useApi().userStudent.qpay
    const ebarimtApi = useApi().userStudent.student.ebarimt
    const studentPaymentApi = useApi().userStudent.student.payment
    const paymentdetailApi = useApi().userStudent.student.paymentdetail

    const handlePaymentModal = () => {
        // setModal(!modal)
        if(datas?.last_balance < 0) {
            handleCreateQpay()
        }
    }

    // Төлбөрийн нэхэмжлэл үүсгэж байгаа хэсэг
    async function handleCreateQpay() {
        const { id: studentId } = userDetail?.student

        const tuluh_dun = datas?.last_balance < 0 ? Math.abs(datas?.last_balance) : 0
        // Шимтгэл тооцсон дүн
        var last_amount = parseFloat(tuluh_dun) + FEE

        if (studentId && tuluh_dun) {
            var cdata = {
                'amount': last_amount,
                'status': STUDY,                    // Төлбөрийн зориулалт
            }

            const { success, data } = await qpayFetchData(qpayApi.create(studentId, cdata))
            if (success) {

                // Төлбөр төлөх хугацааг generate хийнэ
                sessionStorage.setItem("timerMinutes", 15);
                sessionStorage.setItem("timerSeconds", 0);

                // Функцийг Context-аар дамжуулах
                setHandleAction(() => refreshDatas);

                navigate(`/invoice`, { state: { userDetail: userDetail?.student, paymented_total: tuluh_dun, qpay: data, dedication: STUDY } })
            }
        }
    }


    // Энэ улирлын төлбөрийн мэдээлэл
    async function getDatas() {
        if(studentId) {
            const { success, data } = await fetchData(studentPaymentApi.get(studentId, false))
            if(success) {
                setDatas(data?.datas || {})
                setIsKorea(data?.is_korea || false)
            }
        }
    }

    // Бүх гүйлгээний төлбөрийн мэдээлэл
    async function getTransactionDatas() {
        if(studentId) {
            const { success, data } = await fetchData(paymentdetailApi.getTransiction(studentId))
            if(success) {
                setTransactionDatas(data)
            }
        }
    }

    // Бодолт хийгдсэн төлбөрийн мэдээлэл
    async function getEstimateDatas() {
        if(studentId) {
            const { success, data } = await fetchData(paymentdetailApi.get(studentId))
            if(success) {
                setEstimateDatas(data)
            }
        }
    }

    function refreshDatas() {
        getDatas()
        getEstimateDatas()
        getTransactionDatas()
    }

    useEffect(() => {
        refreshDatas()
    },[studentId])

    // Баримт хэвлэх
    function handlePrint(cdata, isSmall) {
        // // Print хуудас руу шидэж байна
        // let print_path = "payment-information/ebarimt/print/"

        // // Жижиг хэмжээгээр хэвлэх
        // if(isSmall) {
        //     print_path = "payment-information/ebarimt/small_print/"
        // }
        // const newTabUrl = `${print_path}`;

        // const jsonString = JSON.stringify(cdata);
        // sessionStorage.setItem("ebarimtDatas", jsonString)
        // window.open(newTabUrl);

        navigate(`ebarimt/small_print/`, { state: cdata }  )

    }

    async function printEbarimtDatas(is_print, cdata) {
        let send_data = {
            'transactionId': cdata?.id,
            'barimt_action_type': 1
        }

        const { success, data } = await ebarimtFetchData(ebarimtApi.send(send_data))
        if(success) {
            if(is_print) { handlePrint(data, true) }
            else {
                setBarimtDetailDatas(data)
                setBarimtDetailModal(!barimtDetailModal)
            }
        }
    }

    return (
        <Fragment>
            <Card>
                {(isLoading || qpayLoading) && Loader}
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom mb-1'>
                    <CardTitle tag='h4'>{t('Төлбөрийн мэдээлэл')}</CardTitle>
                </CardHeader>
                <CardBody>
                    <Row>
                        <Col xl={6} md={12}>
                            <PaymentCard datas={datas} handlePaymentModal={handlePaymentModal} />
                        </Col>
                        <Col xl={6} md={12}>
                            <TransactionHistory datas={transactionDatas} printEbarimtDatas={printEbarimtDatas} />
                        </Col>
                        {
                            isKorea
                            ?
                                <Col xl={12}>
                                    <div className="bg-light-primary p-1 fw-bolder d-flex align-items-center gap-50 my-1" style={{ fontSize: 12, borderRadius: '50px 50px 50px 50px' }}>
                                        <FiAlertCircle strokeWidth={3} size={24}/> IEAA сангаас төлөгдсөн. Төлбөрөө шалгахыг хүсвэл сургуулийнхаа санхүүгийн албанаас мэдээлэл авна уу !!!.
                                    </div>
                                </Col>
                            :
                                null
                        }
                        <Col xl={12}>
                            <SeasonPayment datas={estumateDatas?.datas || []} total={estumateDatas?.total} studentInfo={userDetail?.student || {}} />
                        </Col>
                    </Row>
                </CardBody>
            </Card>
            {
                modal
                &&
                <PaymentModal
                    isOpen={modal}
                    handleModal={handlePaymentModal}
                    student_id={studentId}
                    status={STUDY}
                    paymented_total={datas?.last_balance < 0 ? Math.abs(datas?.last_balance) : 0}
                    student={userDetail?.student}
                    payment_desc={'ST'}
                    refreshDatas={refreshDatas}
                    isFullPayment={true}
                />
            }
            {
                barimtDetailModal &&
                <SmallPrintModal
                    isOpen={barimtDetailModal}
                    datas={barimtDetailDatas}
                    handleModal={() => setBarimtDetailModal(!barimtDetailModal)}
                />
            }
        </Fragment>
    )
}

export default PaymentInformation

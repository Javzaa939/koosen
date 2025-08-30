import React, { Fragment, useEffect, useState, useContext } from "react";
import { t } from 'i18next';

import {
    Col,
    Row,
    Card,
	Modal,
    Input,
    Label,
    Alert,
    Badge,
    Button,
    CardBody,
	ModalBody,
    CardHeader,
	ModalHeader,
} from "reactstrap";

import { moneyFormat, get_repayOption } from '@utils'

import { QPay } from "./Qpay";

import useApi from '@hooks/useApi';
import useModal from '@hooks/useModal'
import useLoader from '@hooks/useLoader';

import ActiveYearContext from '@context/ActiveYearContext'

/**
 * status: Payment model -ийн dedication field ямар төрлийн төлбөр төлөх гэж байгаа
 * paymented_total: Төлбөл зохих мөнгөн дүн
 * student: Оюутны ерөнхий мэдээлэл
 * payment_desc: Төлбөрийн гүйлгээний утга
 * isFullPayment: Төлбөрийг бүтэн авах эсэх
 * isAdmissionUser: Элсэгч эсэх
 * exitModalAction: modal хаах үед төлбөр төлсөн эсэхийг шалгана гэхдээ ямар нэгэн үйлдэл хийх эсэх
*/
export function PaymentModal({isOpen, handleModal, student_id, status, paymented_total, student, refreshDatas='', handleAction='', pay_ids=[], isFullPayment=false, isAdmissionUser=false, dormitoryRoomId='', roomTypeId='', exitModalAction=true}) {
    const { code, register_num, last_name='', first_name='', phone='' } = student

    const desc = `${register_num || ''} ${code} ${phone || ''} ${last_name || ''} ${first_name}`

    // Шимтгэл
    let FEE = 100

    // local дээр ажиллах хэсэг
    // if(code === 'BAM23D045' || process.env.NODE_ENV === "development") {
    //     paymented_total = 1
    // }

    const initialMinutes = 5
    const initialSeconds = 0

    const repayOption = get_repayOption()

    const { showWarning } = useModal()

    const seasons = ['Намар', 'намар']

    const [showQpay, setQpay] = useState(false)
    const [paymentId, setPaymentId] = useState('')
    const [minutes, setMinutes] = useState(initialMinutes)
    const [seconds, setSeconds] = useState(initialSeconds)
    const [intervals, setIntervals] = useState([]);
    const [isQrPay, setQrPay] = useState(false)
    const [qp_img, setQpImg] = useState('')
    const [shortUrl, setShortUrl] = useState('')
    const [paymentDesc, setPaymentDesc] = useState({})
    const [payPercent, setPayPercent] = useState(100)
    const { cseason_name } = useContext(ActiveYearContext)

    let amount = parseFloat(Math.abs(paymented_total || 0))
    amount = (amount * payPercent) / 100
    var last_amount = amount + FEE

    const { isLoading, Loader, fetchData, setLoading } = useLoader({ isFullScreen: true })

    // Api
    const qpayApi = useApi().userStudent.qpay

    const handleQpay = () => {
        setQpay(!showQpay)
    }

    // Төлбөр төлөгдсөн эсэхийг шалгаж байгаа хэсэг
    async function payCheck() {
        try {
            if (paymentId) {
                const {success, data } = await fetchData(qpayApi.check(paymentId))
                if (success) {
                    setPaymentDesc(data)
                    if(data?.is_payment) {
                        handleModal()
                        refreshDatas && refreshDatas()
                        handleAction && handleAction()
                    }
                }
            }
        } catch (error) {
            setLoading(false)
        }
    };

    // Модал хаах үед төлбөр төлөгдсөн эсэхийг шалгаж байгаа хэсэг
    async function handleExitQpayCheck() {
        if (paymentId) {
            const { success, data } = await fetchData(qpayApi.exitCheckPayment(paymentId))
            if (success) {
                if(data) {
                    if(exitModalAction) {
                        // Төлөгдсөн байвал хөтөлбөрт
                        refreshDatas && refreshDatas()
                        handleAction && handleAction()
                    }
                }
            }
        }
    };

    function clearAllIntervals() {
        intervals.forEach(intervalId => clearInterval(intervalId));
        setIntervals([]);
        setQpay(false)
    }

    useEffect(() => {
        return () => clearAllIntervals();
    }, []);

    function exit() {
        handleModal()
        setPaymentId('')
        clearAllIntervals()
        handleExitQpayCheck()
    }

    const exitModal = () => {
        showWarning({
            question: `Та гарахдаа итгэлтэй байна уу?`,
            onClick: () => exit()
        })
    }

    const restartTimer = () => {
        setMinutes(initialMinutes)
        setSeconds(initialSeconds)
    }

    // Хугацаа дуусах үед хийгдэх үйлдэл
    useEffect(() => {
        if ((minutes === 0 && seconds === 0)) {
            setQpay(false)
            setPaymentId('')
            setPaymentDesc({})
            clearAllIntervals()
            restartTimer()

            // Хугацаа дуусах үед дахин нэг шалгана
            handleExitQpayCheck()
        }
    }, [minutes, seconds])

    // Qpay үүсгэж байгаа хэсэг
    async function handleCreateQpay(is_qr) {
        setQrPay(is_qr)
        if (student_id) {
            var cdata = {
                'desc': desc,
                'amount': parseFloat(last_amount),
                'status': status,
                'ids': pay_ids,
                'roomTypeId': roomTypeId,
                'isAdmissionUser': isAdmissionUser,
                'dormitoryRoomId': dormitoryRoomId,
            }

            const { success, data } = await fetchData(qpayApi.create(student_id, cdata))
            if (success) {
                setPaymentId(data?.payment)
                setShortUrl(data?.qpay_short_url)
                if(is_qr) {
                    // qpay-р төлөх буюу qr уншуулж байгаа үед
                    setQpImg(data?.img)
                    handleQpay()
                } else {
                    // Бусад банкны апп болон wallet ашиглан төлөх үед шууд qpay-н deeplink рүү үсрүүлнэ
                    // window.open(data?.qpay_short_url, '_blank');
                    window.location.assign(data?.qpay_short_url)
                }
            }
        }
    }

    return (
        <Fragment>
            <Modal
                isOpen={isOpen}
                toggle={exitModal}
                keyboard={true}
                className="modal-dialog-centered modal-md"
                onClosed={handleModal}
            >
                {isLoading && Loader}
                <ModalHeader tag="h3" className='bg-transparent pb-0' toggle={exitModal}>
                    {t('Төлбөр төлөх')}
                </ModalHeader>
                <ModalBody>
                    <Alert color="warning" className="p-50">
                        Төлбөрөө төлсний дараа "Төлбөр шалгах" товч дээр дарж төлөгдсөн эсэхийг шалгана уу.
                    </Alert>
                    {
                        paymentDesc && Object.keys(paymentDesc).length > 0 && paymentId && !isQrPay &&
                        <p>
                            <Badge pill color={paymentDesc?.color} >
                                {paymentDesc?.text}
                            </Badge>
                        </p>
                    }
                    <Card>
                        <CardBody>
                            {
                                // Зөвхөн намрын улиралд хувааж төлөх боломжтой гэж үзсэн
                                seasons.includes(cseason_name) && !isFullPayment &&
                                <div className="mb-1">
                                    {
                                        repayOption?.map((val, idx) => {
                                            return (
                                                <div className="me-1 mb-50 form-check" key={idx}>
                                                    <Input
                                                        id={`boxed-${val.id}`}
                                                        type='radio'
                                                        className="me-50"
                                                        value={val?.value}
                                                        checked={payPercent == val?.value}
                                                        disabled={paymentId ? true : false}
                                                        onChange={(e) => setPayPercent(e.target.value)}
                                                    />
                                                    <Label className='form-check-label text-dark' for={`boxed-${val.id}`}>
                                                        {val?.name}
                                                    </Label>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            }
                            <span style={{ fontSize: '14px'}} className={`fw-bolder me-50 d-block text-${isFullPayment ? 'start' : 'end'}`}>Төлөх дүн: <span className='fw-bolder mb-0 text-primary'>{moneyFormat(amount)}₮</span></span>
                            {
                                FEE &&
                                <span style={{ fontSize: '14px'}} className={`fw-bolder me-50 d-block text-${isFullPayment ? 'start' : 'end'}`}>Гүйлгээний шимтгэл: <span className='fw-bolder mb-0 text-primary'>{moneyFormat(FEE)}₮</span></span>
                            }
                            <span style={{ fontSize: '14px'}} className={`fw-bolder me-50 d-block text-${isFullPayment ? 'start' : 'end'}`}>Нийт төлөх дүн: <span className='fw-bolder mb-0 text-primary'>{moneyFormat(last_amount)}₮</span></span>
                        </CardBody>
                    </Card>
                    {
                        paymentId && !isQrPay
                        ?
                            <div className="d-flex justify-content-end">
                                <Button color="primary" onClick={() => payCheck()} disabled={isLoading}>{t('Төлбөр шалгах')}</Button>
                            </div>
                        :
                            !paymentId &&
                            <Card className='plan-card border-primary'>
                                <CardHeader>
                                    <h5 className="fw-bolder">Төлбөр төлөх боломжууд</h5>
                                    <Alert color="primary" className="p-50 mb-0">
                                        <small>Гар утсаар хандаж байгаа бол "Банкны апп" дээр дарж төлбөрийн хэрэгслээ сонгоод төлбөрөө төлөх боломжтой.</small>
                                    </Alert>
                                </CardHeader>
                                <CardBody>
                                    <Row className="gy-1">
                                        <Col md={6}>
                                            <Button outline color="primary" onClick={() => handleCreateQpay(true)} disabled={isLoading}>
                                                <i className="fa fa-qrcode fa-lg me-50" /> <span className="fw-bolder">Qpay</span>
                                            </Button>
                                        </Col>
                                        <Col md={6}>
                                            <Button outline color="success" onClick={() => handleCreateQpay(false)} disabled={isLoading}>
                                                <i className="fas fa-wallet fa-lg"></i> <span className="fw-bolder">Банкны апп</span>
                                            </Button>
                                        </Col>
                                    </Row>
                                </CardBody>
                            </Card>
                    }
                    {
                        showQpay &&
                        <QPay
                            student_id={student?.id}
                            amount={last_amount}
                            desc={desc}
                            minutes={minutes}
                            seconds={seconds}
                            setMinutes={setMinutes}
                            setSeconds={setSeconds}
                            payCheck={payCheck}
                            status={status}
                            isQrPay={isQrPay}
                            payment_id={paymentId}
                            qp_img={qp_img}
                            paymentDesc={paymentDesc}
                            isLoading={isLoading}
                            shortUrl={shortUrl}
                        />
                    }
                </ModalBody>
            </Modal>
        </Fragment>
    )
}

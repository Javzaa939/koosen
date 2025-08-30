import React, { useEffect } from "react"
import { Spinner, Button, Badge } from "reactstrap"

import { t } from "i18next"

export function QPay(props) {
    const {
        minutes,
        seconds,
        setMinutes,
        setSeconds,
        payCheck,
        payment_id,
        qp_img,
        paymentDesc,
        isLoading,
        shortUrl,
    } = props

    useEffect(()=> {
        let myInterval = setInterval(() => {
            if (seconds > 0) {
                setSeconds(seconds - 1);
            }
            if (seconds === 0) {
                if (minutes === 0) {
                    clearInterval(myInterval)
                } else {
                    setMinutes(minutes - 1);
                    setSeconds(59);
                }
            }
        }, 1000)

        return () => {
            clearInterval(myInterval);
        };
    });

    return (
        <div className="text-center">
            <div>
                {
                    qp_img != []
                    ?
                        (minutes === 0 && seconds === 0
                        ?
                            <h5 className="text-warning">Хугацаа дууссан!</h5>
                        :
                            <h5>Хугацаа: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}</h5>
                        )
                    :
                        null
                }
            </div>
            <h5 className="text-primary mb-1">QR Code уншуулна уу.</h5>
            {
                qp_img != []
                ?
                    <>
                        <img
                            className="shadow p-25 mb-1 bg-white rounded"
                            src={"data:image/png;base64," + qp_img}
                            style={{ maxWidth: 400, width: '100%' }}
                        />
                        {
                            payment_id &&
                            <>
                                {
                                    paymentDesc && Object.keys(paymentDesc).length > 0 &&
                                    <p>
                                        <Badge color={paymentDesc?.color} >
                                            {paymentDesc?.text}
                                        </Badge>
                                    </p>
                                }
                                <div>
                                    <Button color='primary' className="mt-50 me-50" disabled={isLoading} onClick={() => payCheck()}>
                                        {isLoading && <Spinner color='white' size='sm' />}
                                        <span className='ms-50'>{isLoading ? 'Түр хүлээнэ үү...' : 'Төлбөр шалгах'}</span>
                                    </Button>
                                    {
                                        shortUrl &&
                                        <Button outline className="mt-50" color="success" onClick={() =>  window.location.assign(shortUrl)} disabled={isLoading}>
                                            <i className="fas fa-wallet fa-lg"></i> <span className="fw-bolder">Банкны аппаар төлөх</span>
                                        </Button>
                                    }
                                </div>
                            </>
                        }
                    </>
                :
                    <div className='suspense-loader'>
                        <Spinner size='bg'/>
                        <span className='ms-50'>{t('Түр хүлээнэ үү...')}</span>
                    </div>
            }
        </div>
    )
}

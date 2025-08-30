import React from 'react';
import { Table, Button } from 'reactstrap'

import { useTranslation } from 'react-i18next'

import '../style.scss'

const PaymentLink = ({handlePaymentModal}) => {
    const { t } = useTranslation()

    return (
        <Table className="mb-2" bordered responsive>
            <thead>
                <tr>
                    <th className="leftHeader ps-50" colSpan={2}><i className="fa fa-cloud me-50"></i>{t('Онлайнаар төлбөр төлөх')}</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <b>Оюутнуудын анхааралд</b>
                        <p className='mb-0'>Сургалтын төлбөр төлөхдөө дараах форматын дагуу гүйлгээний утгыг оруулна уу.</p>
                        <p className='text-danger'>ST Оюутны код Регистр Овог Нэр Утас</p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <Button className="me-2" color="primary" type="submit" onClick={handlePaymentModal}>
                            {t('Төлбөр төлөх')}
                        </Button>
                    </td>
                </tr>
            </tbody>
        </Table>
    );
};

export default PaymentLink;


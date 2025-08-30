import { Table, Button, UncontrolledTooltip } from 'reactstrap'

import { useTranslation } from 'react-i18next'

import css from "@mstyle/style.module.css"
import moment from 'moment'

import { moneyFormat } from '@utils'
import { Eye, Printer } from 'react-feather'

const TransactionHistory = ({ datas, printEbarimtDatas }) => {
    const { t } = useTranslation()

    return (
        <div className={`${css.tableFixHead} mb-2`} style={{height: datas.length > 4 && '266px'}}>
            <Table size="sm" bordered responsive>
                <thead className="leftHeader">
                    <tr>
                        <th className="leftHeader ps-50" colSpan={3}><i className="fas fa-list me-50"></i>{t('Гүйлгээний түүх')}</th>
                    </tr>
                </thead>
                <thead>
                    <tr>
                        <th className="ps-50">Мөнгөн дүн</th>
                        <th>Огноо</th>
                        <th className='text-center'>E-Баримт</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        datas &&
                        datas.map((data, idx) => {
                            const date = moment(data?.pay_date).format('YYYY-MM-DD HH:mm:ss');
                            return (
                                <tr key={idx}>
                                    <td>{moneyFormat(data?.amount)}</td>
                                    <td>{date}</td>
                                    <td className='text-center'>
                                        {
                                            data?.is_qpay
                                            ?
                                                <Button
                                                    size="sm"
                                                    className="ms-2"
                                                    color="primary"
                                                    disabled={data?.is_qpay}
                                                >
                                                    {data?.is_qpay ? t('Хүлээгдэж буй') : t('Хэвлэх')}
                                                </Button>
                                            :
                                                <>
                                                    <Printer id={`Print${idx}`} role="button" onClick={() => printEbarimtDatas(true, data)} size={14}>
                                                        {data?.is_qpay ? t('Хүлээгдэж буй') : t('Хэвлэх')}
                                                    </Printer>
                                                    <UncontrolledTooltip placement='auto' target={`Print${idx}`}>Хэвлэх</UncontrolledTooltip>

                                                    <Eye role="button" id={`Detail${idx}`} onClick={() => printEbarimtDatas(false, data)} size={14} className="ms-50">
                                                        {data?.is_qpay ? t('Хүлээгдэж буй') : t('Харах')}
                                                    </Eye>
                                                    <UncontrolledTooltip placement='auto' target={`Detail${idx}`}>Харах</UncontrolledTooltip>
                                                </>
                                        }
                                    </td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </Table>
        </div>
    );
};

export default TransactionHistory;

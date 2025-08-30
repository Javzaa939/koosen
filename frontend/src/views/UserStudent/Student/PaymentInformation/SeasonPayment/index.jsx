import { Table } from 'reactstrap'

import { useTranslation } from 'react-i18next'

import { moneyFormat } from '@utils'

import { Printer } from 'react-feather';

import css from "@mstyle/style.module.css"

const SeasonPayment = ({ datas, total, studentInfo }) => {
    const { t } = useTranslation()

    function printModalToggle(row) {
        const myPaymentDatas = { ...row, ...studentInfo };

        sessionStorage.setItem('myPaymentDatas', JSON.stringify(myPaymentDatas))
        window.open('payment-information/print', '_blank')
    }

    return (
        <div className={`${css.tableFixHead} mb-2`} style={{ height: datas.length > 4 && '266px' }}>
            <Table size="sm" bordered responsive>
                <thead className="leftHeader">
                    <tr>
                        <th className="leftHeader ps-50" colSpan={9}><i className="fas fa-clipboard-list me-50"></i>{t('Төлбөрийн түүх')}</th>
                    </tr>
                </thead>
                <thead>
                    <tr>
                        <th className='text-dark ps-50'>Хичээлийн жил</th>
                        <th className='text-dark text-center'>Улирал</th>
                        <th className='text-dark text-end'>Эхний үлдэгдэл</th>
                        <th className='text-dark text-end'>Төлөх төлбөр</th>
                        <th className='text-dark text-end'>Хөнгөлөлт</th>
                        <th className='text-dark text-end'>Төлсөн</th>
                        <th className='text-dark text-end'>Буцаасан</th>
                        <th className='text-dark text-end'>Эцсийн үлдэгдэл</th>
                        <th className='text-dark text-center'>Хэвлэх</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        datas && datas.length > 0 &&
                        datas.map((data, idx) => {
                            return (
                                <tr key={idx}>
                                    <td className='text-dark'>{data?.lesson_year}</td>
                                    <td className='text-dark'>{data?.season_name}</td>
                                    <td className='text-dark' align='end'>{moneyFormat(data?.sum_first_balance)}₮</td>
                                    <td className='text-dark' align='end'>{moneyFormat(data?.sum_payment)}₮</td>
                                    <td className='text-dark' align='end'>{moneyFormat(data?.sum_discount)}₮</td>
                                    <td className='text-dark' align='end'>{moneyFormat(data?.sum_in_balance)}₮</td>
                                    <td className='text-dark' align='end'>{moneyFormat(data?.sum_out_balance)}₮</td>
                                    <td className='text-dark' align='end'>{moneyFormat(data?.sum_last_balance)}₮</td>
                                    <td align='center'>
                                        <a
                                            role="button"
                                            title='Хэвлэх'
                                            onClick={() => {
                                                printModalToggle(data)
                                            }}
                                        >
                                            <Printer width={"15px"} />
                                        </a>
                                    </td>
                                </tr>
                            )
                        })
                    }
                    {/* <tr className='fw-bolder'>
                        <td className='text-dark' colSpan={2}>Нийт дүн</td>
                        <td align='end' className='text-dark'>{moneyFormat(total?.total_first_balance)}₮</td>
                        <td align='end' className='text-dark'>{moneyFormat(total?.total_payment)}₮</td>
                        <td align='end' className='text-dark'>{moneyFormat(total?.total_discount)}₮</td>
                        <td align='end' className='text-dark'>{moneyFormat(total?.total_in_balance)}₮</td>
                        <td align='end' className='text-dark'>{moneyFormat(total?.total_out_balance)}₮</td>
                        <td align='end' className='text-dark'>{moneyFormat(total?.total_last_balance)}₮</td>
                        <td></td>
                    </tr> */}
                </tbody>
            </Table>
        </div>
    );
};

export default SeasonPayment;

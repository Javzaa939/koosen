import { Table } from 'reactstrap'

import { useTranslation } from 'react-i18next'

import '../style.scss'

const ActiveSeasonPayment = ({ datas }) => {
    const { t } = useTranslation()

    return (
        <Table size="sm" bordered responsive className="mb-2">
            <thead className="leftHeader">
                <tr>
                    <th className="leftHeader ps-50" colSpan={2}><i className="fas fa-check-circle me-50"></i> Төлбөрийн мэдээлэл</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th scope="row">{t('Сонгосон кредит')}</th>
                    <td>{datas?.kredit || 0}</td>
                </tr>
                <tr>
                    <th scope="row">{t('Төлөх төлбөр')}</th>
                    <td>{datas?.payment || 0.00}</td>
                </tr>
                <tr>
                    <th scope="row">{t('Хөнгөлөлт, Урамшуулал')}</th>
                    <td>{datas?.discount || 0.00}</td>
                </tr>
                <tr>
                    <th scope="row">{t('Өмнөх үлдэгдэл')}</th>
                    <td>{datas?.first_balance || 0.00}</td>
                </tr>
                {/* <tr>
                    <th scope="row">{t('СТС-гийн санхүүжилт')}</th>
                    <td>{0.00}</td>
                </tr> */}
                <tr>
                    <th scope="row">{t('Төлсөн төлбөр')}</th>
                    <td>{datas?.in_balance || 0.00}</td>
                </tr>
                <tr>
                    <th scope="row">{t('Буцаасан төлбөр')}</th>
                    <td>{datas?.out_balance || 0.00}</td>
                </tr>
                <tr>
                    <th scope="row">{t('Төлбөрийн дутуу')}</th>
                    <td>{datas?.balance_dutuu || 0.00}</td>
                </tr>
                <tr>
                    <th scope="row">{t('Төлбөрийн илүү')}</th>
                    <td>{datas?.balance_iluu || 0.00}</td>
                </tr>
            </tbody>
        </Table>
    );
};

export default ActiveSeasonPayment;


import { useEffect, useState } from 'react';
import { Table, Badge } from 'reactstrap'

import { useTranslation } from 'react-i18next';

const CTable = ({ datas, title }) => {

    const { t } = useTranslation()

    const getBadge = (status) => {
        if (status == 1) {
            return (
                <Badge color="light-success" pill>
                    {t('Үзcэн')}
                </Badge>
            )
        } else if(status == 2) {
            return (
                <Badge color="light-danger" pill>
                    {t('Үзээгүй')}
                </Badge>
            )
        } else {
            return (
                <Badge color="light-primary" pill>
                    {t('Үзэж байгаа')}
                </Badge>
            )
        }
    }

    const [total_kredit, setTotalKredit] = useState(0)

    useEffect(() => {
        var sum_kredit = 0

        datas.map((value) => {
            if(value.lesson.kredit) {
                sum_kredit += value.lesson.kredit
            }
        })
        setTotalKredit(sum_kredit)
    }, [datas])


    return (
        <div>
            <Table className='mb-2' size='sm' bordered responsive>
                <thead>
                    <tr>
                        <th colSpan={6}>{title}</th>
                    </tr>
                </thead>
                <thead>
                    <tr>
                        <th>№</th>
                        <th>Хичээлийн код</th>
                        <th>Хичээлийн нэр</th>
                        <th>Кредит</th>
                        <th>Төлөв</th>
                    </tr>
                </thead>
                <tbody >
                    {
                        datas.map((datas, index) => {
                            return (
                                <tr key={index}>
                                    <th scope="row">{index+1}</th>
                                    <td>{datas.lesson.code}</td>
                                    <td>{datas.lesson.name}</td>
                                    <td>{datas.lesson.kredit}</td>
                                    <td>
                                        {
                                            getBadge(datas.status)
                                        }
                                    </td>
                                </tr>
                            )
                        })
                    }
                <tr>
                    <td colSpan={6}>Нийт кредит: {total_kredit}</td>
                </tr>
                </tbody>
            </Table>
        </div>
        )
    }
export default CTable


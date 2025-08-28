
import { Table } from 'reactstrap'
import { useEffect, useState } from 'react';
import { fontStyle, textAlign } from '@mui/system';


const CTable = ({ data, title }) => {

    const [total_kredit, setTotalKredit] = useState([])
    const [total_score, setTotalScore] = useState(0)
    const [gpa, setGpa] = useState([])
    // useEffect(() => {
    //     var sum_kredit = 0

    //     data.map((value) => {
    //         if(value.lesson.kredit) {
    //             sum_kredit += value.lesson.kredit
    //         }
    //     })
    //     setTotalKredit(sum_kredit)
    // }, [data])
    return (
            <Table size='sm' bordered responsive >
                <thead>
                    <tr>
                        <th colSpan={15}>{title}</th>
                    </tr>
                </thead>
                <thead>
                    <tr style={{textAlign: "center"}} >
                        <th>№</th>
                        <th>Хичээлийн нэр</th>
                        <th>Багшийн нэр</th>
                        <th>Кредит</th>
                        <th>Дүн</th>
                        <th>Голч дүн</th>
                        <th>Чанарын оноо</th>
                    </tr>
                </thead>
                <tbody >
                {
                        data.season_info.map((value, index) => {
                            return (
                                <tr key={index} style={{textAlign: "center"}} >
                                    <th scope="row">{index+1}</th>
                                    <td style={{ textAlign: "left", marginLeft: "10px" }}>{value?.lesson_code} {value?.lesson_name}</td>
                                    <td>{value?.teacher_code && value?.teacher_full_name ? `/${value?.teacher_code}/ ${value?.teacher_full_name}` : ''}</td>
                                    <td>{value?.lesson_krt}</td>
                                    <td>{value?.score} {value?.assessment}</td>
                                    <td>{value?.gpa}</td>
                                    <td>{value?.index_score}</td>
                                </tr>

                            )
                        })
                    }

                    <tr style={{textAlign: "center"}} ><td></td>
                        <th colSpan={1}>Нийт</th>
                        <th></th>
                        <th colSpan={1}>{data.total.kredit}</th>
                        <th colSpan={1}>{data.total.onoo}</th>
                        <th style={{textAlign: "center"}} colSpan={1}>Улирлын голч дүн: {data.total.gpa}</th>
                        <th style={{textAlign: "center"}} colSpan={1}>{data.total.total_index_score}</th>
                    </tr>
                </tbody>
            </Table>
        )
    }
export default CTable


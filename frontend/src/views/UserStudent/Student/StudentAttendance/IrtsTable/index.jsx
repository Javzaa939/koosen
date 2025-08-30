// ** React Import
import { Badge, Table } from 'reactstrap'
import { Circle } from 'react-feather'

import '../style.scss'
const IrtsTable = props => {

    const {
        data
    } = props

    // ромбо тоо руу хөрвүүлэгч функц
    let numerals = {
        M: 1000,
        CM: 900,
        D: 500,
        CD: 400,
        C: 100,
        XC: 90,
        L: 50,
        XL: 40,
        X: 10,
        IX: 9,
        V: 5,
        IV: 4,
        I: 1,
    };

    const convertToRoman = (num) => {
        let newNumeral = "";

        for (let i in numerals) {
            while (num >= numerals[i]) {
                newNumeral += i;
                num -= numerals[i];
            }
        }

        return newNumeral;
    }

    return (
        <div>
            <Table bordered>
                <thead>
                    <tr>
                        <th colSpan={1}>Хичээл</th>
                        {Array.from({ length: 17 }, (_, idx) => (
                            <th key={`roman${idx}`}>{convertToRoman(idx)}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className='irtstabledark'>
                    {data.map((data, idx) => (
                        <tr key={`maindata${idx}`} className=''>
                            <td className='p-50'>{data?.lesson_name}</td>
                            <td key={`datatype${idx}`}>
                                {data?.types?.map((typeData, tidx) => (
                                <div key={tidx} className='my-50'>
                                    {typeData.name}
                                </div>
                                ))}
                            </td>

                            {Array.from({ length: 16 }, (_, cidx) => (
                                <td key={`cells${cidx}`} className=''>
                                    {data?.types?.map((data, didx) =>
                                        {
                                            var irts = data.irts
                                            var week_irts = irts.find((c) => c.week === cidx + 1)
                                            return (
                                                <div key={`medehgui${didx}`} className='my-50 d-flex justify-content-center align-items-center'>
                                                    <Badge
                                                        className={`p-50 rounded-4
                                                            ${
                                                                week_irts?.state_name === 'Ирсэн' ? '' :
                                                                week_irts?.state_name === 'Тас' ? '' :
                                                                week_irts?.state_name === 'Чөлөөтэй' ? '' :
                                                                week_irts?.state_name === 'Өвчтэй' ? '' :
                                                                'customopacity'
                                                            }
                                                        `}
                                                        color={
                                                            week_irts?.state_name === 'Ирсэн' ? 'light-success' :
                                                            week_irts?.state_name === 'Тас' ? 'light-danger' :
                                                            week_irts?.state_name === 'Чөлөөтэй' ? 'light-warning' :
                                                            week_irts?.state_name === 'Өвчтэй' ? 'light-info' :
                                                            'light-secondary'
                                                        }>

                                                            {week_irts?.state_name.length > 0 ? week_irts?.state_name.charAt(0) : <Circle />}
                                                    </Badge>
                                                </div>
                                            )
                                        }
                                    )}
                                </td>
                            ))}
                        </tr>

                    ))}
                </tbody>
            </Table>


        </div>
    )
}

export default IrtsTable


import { Table, Row, Col } from 'reactstrap'


const CTable = ({ data, title }) => {

    return (
        <div>
            <Table size='sm' bordered responsive >
                <thead>
                    <tr>
                        <th colSpan={15}>
                            <div className='d-flex justify-content-between'>
                                <span>{title}</span>
                                <span>{data?.teacher_name}</span>
                            </div>
                        </th>
                    </tr>
                </thead>
                <thead>
                    <tr>
                        <th>№</th>
                        <th>Төрөл</th>
                        <th>Авах оноо</th>
                        <th>Авсан оноо</th>
                    </tr>
                </thead>
                <tbody >
                    {
                        data.scores.map((value, index) => {
                            return (
                                    <tr key={index}>
                                        <th scope="row">{index+1}</th>
                                        <td>{value?.type_name}</td>
                                        <td>{value?.take_score}</td>
                                        <td>{value?.score}</td>
                                    </tr>

                            )
                        })
                    }

                </tbody>
            </Table>
            <Row className='mx-1'>
                    <Col md={8}></Col>
                    <Col md={4} className='d-flex justify-content-start mb-1'>
                        <table className='w-100'>
                            <tbody>
                            <tr className='border-bottom'>
                                <td className='p'>Нийт оноо:</td>
                                <td className='text-end fw-bolder'>{data?.total}</td>
                            </tr>
                        </tbody>
                    </table>
                    </Col>
                </Row>
        </div>
        )
    }
export default CTable


import React from 'react'
import { Card, CardBody, Col, Row, CardHeader, Button, CardTitle } from 'reactstrap'
import BreadCrumbs from '@components/breadcrumbs';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus } from 'react-feather'
import DragProfession from './DragProfession';

export default function Profession() {
    const location = useLocation();
    const datas = location.state
    return (
        <Card>
            <Row className="mt-2 d-flex  flex-row align-items-center border-bottom m-1">
                <BreadCrumbs title={'Элсэлт'} data={[{ title: 'Элсэлтийн жагсаалт', link: '/elselt/register/' }, { title: 'Хөтөлбөрийн жагсаалт' }]} />
            </Row>
            <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
                <div>
                    <span className='fw-bold'>{datas?.name}
                    <br/> <span>{datas?.begin_date} -  {datas?.end_date}</span></span>
                </div>
            </CardHeader>
            <CardBody>
                <DragProfession/>
            </CardBody>
        </Card>
    )
}

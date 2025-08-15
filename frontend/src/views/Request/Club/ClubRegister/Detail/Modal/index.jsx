import React, { Fragment } from 'react';

import { Typography } from '@mui/material';

// import CCarousel from "@lms_components/Carousel";

import { Card, Row, Col } from 'reactstrap';

export default function CDetailModal(props) {
    const emptyImage = require('@src/assets/images/empty-image.jpg').default;

    const default_emptyImage = [
        {
            description: '',
            file: require('@src/assets/images/empty-image.jpg').default,
        },
    ];

    const { datas } = props;

    return (
        <Fragment>
            <Card body>
                <Row>
                    <Col xs={12} md={5}>
                        {/* <CCarousel items={(datas?.files.length !== 0) ? datas?.files : default_emptyImage } /> */}
                    </Col>
                    <Col xs={12} md={7}>
                        <>
                            <Row>
                                <Col xs={12} className="fw-bolder mb-1 text-center h5">
                                    <h4 align="center"> {datas?.name} </h4>
                                    <Typography variant="body2">{datas?.purpose}</Typography>
                                </Col>
                                <Col xs={6}>Байгуулагдсан он:</Col>
                                <Col xs={6}>
                                    <Typography align="right">{datas?.start_year}</Typography>
                                </Col>
                                <hr />
                                <Col xs={6}>Үйл ажиллагааны чиглэл:</Col>
                                <Col xs={6}>
                                    <Typography align="right">{datas?.type_name}</Typography>
                                </Col>
                                <hr />
                                <Col xs={6}>Удирдагчийн мэдээлэл:</Col>
                                <Col xs={6}>
                                    <Typography align="right">{datas?.leader}</Typography>
                                </Col>
                                <hr />
                                <Col xs={6}>Идэвхтэй гишүүдийн тоо:</Col>
                                <Col xs={6}>
                                    <Typography align="right">{datas?.member_count}</Typography>
                                </Col>
                                <hr />
                            </Row>
                        </>
                    </Col>
                </Row>
            </Card>
        </Fragment>
    );
}

// ** React imports
import React, { Fragment, useState, useEffect } from 'react'

import { X } from "react-feather";

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import { Row, Col, Modal,  Label, Button, ModalBody, ModalHeader, Input } from "reactstrap";

import { t } from 'i18next';
import { AlertCircle } from 'react-feather';


const shalguurs = [
    {
        'name': 'Нийтлэг шалгуур',
        'datas': [
            {
                'id': 1,
                'name': 'ЭЕШ-ын оноо'
            },
            {
                'id': 2,
                'name': 'Хяналтын тоо'
            }
        ]
    },
    {
        'name': 'Тусгай шалгуур',
        'datas': [
            {
                'id': 3,
                'name': 'Нас'
            },
            {
                'id': 4,
                'name': 'Эрүүгийн хариуцлага хүлээж байсан эсэх лавлагаа'
            },
            {
                'id': 5,
                'name': 'Эрүүл мэнд анхан'
            },
            {
                'id': 6,
                'name': 'Эрүүл мэнд мэргэжлийн'
            },
            {
                'id': 7,
                'name': 'Бие бялдар'
            },
            {
                'id': 8,
                'name': 'Сэтгэлзүйн ярилцлага'
            },
            {
                'id': 9,
                'name': 'Төгссөн сургууль'
            },
            {
                'id': 10,
                'name': 'Cудалгааны ажлын агуулга чиглэл, зорилгын талаар бичсэн танилцуулга'
            },
            {
                'id': 13,
                'name': 'Монгол хэл эсcэ бичлэг'
            },
        ]
    }
]

const ShalguurModal = ({ open, handleModal, refreshDatas, admission_data }) => {

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    // ** Hook
    const [ shalguurIds, setShalguurIds ] = useState([])
    const [ hynaltToo, setHynaltToo ] = useState({
        'norm_all': '',
        'norm1': '',
        'norm2': ''
    })

    const [ nasYear, setNasYear ] = useState({
        'limit_min': '',
        'limit_max': ''
    })

	// Loader
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    const elseltApi = useApi().elselt.profession

    // Хадгалах
	async function onSubmit() {
        var cdatas = {
            'shalguurIds': shalguurIds,
            'hynaltToo': hynaltToo,
            'nasYear': nasYear,
            'admission': Object.keys(admission_data).length > 0 ? admission_data?.id : ''
        }
        const { success, errors } = await postFetch(elseltApi.postShalguur(cdatas))
        if(success) {
            refreshDatas()
            handleModal()
        } else {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in errors) {
                setError(key, { type: 'custom', message:  errors[key][0]});
            }
        }
	}

    useEffect(
        () =>
        {
            if (Object.keys(admission_data).length > 0) {
                if (admission_data?.shalguur_ids) {
                    setShalguurIds(admission_data?.shalguur_ids)
                }
                if (admission_data?.nas) {
                    setNasYear(admission_data?.nas)
                }
                if (admission_data?.hynalt_too) {
                    setHynaltToo(admission_data?.hynalt_too)
                }
            }
        },
        [admission_data]
    )

    const handleShalguur = (checked, id) => {
        if (checked) {
            setShalguurIds([...shalguurIds, id])
        } else {
            if (id === 1) {
                setHynaltToo({
                    norm_all: '',
                    norm1: '',
                    norm2: ''
                })
            }

            if (id === 3) {
                setNasYear({
                    limit_min: '',
                    limit_max: ''
                })
            }

            var checked_ids = [...shalguurIds]

            const index = shalguurIds.indexOf(id);
            if (index > -1) {
                checked_ids.splice(index, 1)
            }
            setShalguurIds(checked_ids)
        }
    }

	return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className="modal-dialog-centered modal-lg"
                contentClassName="pt-0"
                backdrop='static'
            >
                <ModalHeader
                    toggle={handleModal}
                    close={CloseBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{t('Шалгуур')}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <div className='mb-50 text-end' >
                        <Button color='primary' size='sm' onClick={onSubmit}>Хадгалах</Button>
                    </div>
                    <div className='d-flex row p-1 border'>
                        <Col md={6} sm={12}>
                            {
                                shalguurs.map((shalguur, cidx) => {
                                    return (
                                        <Fragment key={cidx}>
                                            <div className='d-flex justify-content-start'>
                                                <AlertCircle size={15} className='me-25'/>
                                                <h5>{shalguur?.name}</h5>
                                            </div>
                                            {
                                                shalguur?.datas?.map((data, idx) =>
                                                    <div className='ms-1' key={idx}>
                                                        <Input
                                                            type='checkbox'
                                                            checked={shalguurIds.includes(data?.id)}
                                                            onChange={(e) => handleShalguur(e.target.checked, data?.id)}
                                                        />
                                                        <Label className='ms-50'>{data?.name}</Label>
                                                    </div>
                                                )
                                            }
                                        </Fragment>
                                    )
                                })
                            }
                        </Col>
                        <Col md={6} className='border p-1'>
                            {
                                shalguurIds.includes(2)
                                &&
                                    <Fragment>
                                        <Row>
                                            <h5>Хяналтын тоо</h5>
                                            <Col md={4}>
                                                <Label>Нийт тоо</Label>
                                                <Input
                                                    type='number'
                                                    bsSize='sm'
                                                    value={hynaltToo.norm_all}
                                                    onChange={(e) => setHynaltToo(current => {
                                                        return {
                                                            ...current,
                                                            norm_all: e.target.value
                                                        }
                                                    })}
                                                    placeholder='Нийт тоо'
                                                />
                                            </Col>
                                            <Col md={4}>
                                                <Label>Эрэгтэй тоо</Label>
                                                <Input
                                                    type='number'
                                                    bsSize='sm'
                                                    value={hynaltToo.norm1}
                                                    placeholder='Эрэгтэй тоо'
                                                    onChange={(e) => setHynaltToo(current => {
                                                        return {
                                                            ...current,
                                                            norm1: e.target.value
                                                        }
                                                    })}
                                                />
                                            </Col>
                                            <Col md={4}>
                                                <Label>Эмэгтэй тоо</Label>
                                                <Input
                                                    type='number'
                                                    bsSize='sm'
                                                    placeholder='Эмэгтэй тоо'
                                                    value={hynaltToo.norm2}
                                                    onChange={(e) => setHynaltToo(current => {
                                                        return {
                                                            ...current,
                                                            norm2: e.target.value
                                                        }
                                                    })}
                                                />
                                            </Col>
                                        </Row>
                                    </Fragment>
                                }
                                <hr/>
                                {
                                    shalguurIds.includes(3)
                                    &&
                                    <Fragment>
                                        <Row className='mt-1'>
                                            <h5>Насны хязгаар</h5>
                                            <Col md={6}>
                                                <Label>Насны шалгуурын доод хязгаар</Label>
                                                <Input
                                                    type='number'
                                                    bsSize='sm'
                                                    value={nasYear.limit_min}
                                                    placeholder='Насны шалгуурын доод хязгаар'
                                                    onChange={(e) => setNasYear(current => {
                                                        return {
                                                            ...current,
                                                            limit_min: e.target.value
                                                        }
                                                    })}
                                                />
                                            </Col>
                                            <Col md={6}>
                                                <Label>Насны шалгуурын дээд хязгаар</Label>
                                                <Input
                                                    type='number'
                                                    bsSize='sm'
                                                    placeholder='Насны шалгуурын дээд хязгаар'
                                                    value={nasYear.limit_max}
                                                    onChange={(e) => setNasYear(current => {
                                                        return {
                                                            ...current,
                                                            limit_max: e.target.value
                                                        }
                                                    })}
                                                />
                                            </Col>
                                        </Row>
                                    </Fragment>
                                }
                        </Col>
                    </div>
                </ModalBody>
            </Modal>
        </Fragment>
	);
};
export default ShalguurModal;

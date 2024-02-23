// ** React imports
import React, { Fragment, useState, useContext } from 'react'

import { AlertCircle, X } from "react-feather";

import Select from 'react-select'
import classnames from "classnames";
import { ReactSelectStyles } from "@utils"

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import SchoolContext from "@context/SchoolContext"
import Flatpickr from 'react-flatpickr'

import { useForm, Controller } from "react-hook-form";

import { Row, Col, Form, Modal, Collapse, Label, Button, ModalBody, ModalHeader, FormFeedback, Spinner, Input, Table } from "reactstrap";

import { validate, generateLessonYear } from "@utils"
import '@styles/react/libs/flatpickr/flatpickr.scss'

// import { validateSchema } from '../validateSchema';
import { useEffect } from 'react';
import { t } from 'i18next';

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
                'name': 'Ял шийтгэл'
            },
            {
                'id': 5,
                'name': 'Бие бялдар'
            },
            {
                'id': 6,
                'name': 'Сэтгэлзүйн ярилцлага'
            },
            {
                'id': 7,
                'name': 'Төгссөн сургууль'
            },
        ]
    }
]

const Addmodal = ({ open, handleModal, refreshDatas }) => {

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    const { school_id } = useContext(SchoolContext)

    // ** Hook
    const { control, handleSubmit, reset, setValue, setError, formState: { errors } } = useForm();

    const [ profOption, setProfession] = useState([])
    const [isOpen, setIsOpen] = useState(false)
    const [ yearOption, setYear] = useState([])
    const [ shalguurId, setShalguurId ] = useState('')
    const [ hutuburId, setHutulburId ] = useState('')
    const [ shalguurIds, setShalguurIds ] = useState([])
    const [ submitDatas, setSubmitDatas ] = useState([])
    const [ hynaltToo, setHynaltToo ] = useState({
        'all': '',
        'men': '',
        'women': ''
    })

    const [ nasYear, setNasYear ] = useState({
        'men': '',
        'women': ''
    })


	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    const groupApi = useApi().student.group
    const professionApi = useApi().study.professionDefinition


    // Хөтөлбөрийн жагсаалт авах
    async function getProfession () {
        const { success, data } = await fetchData(professionApi.getList('', ''))
        if (success) {
            setProfession(data)
        }
	}

    // хичээлийн жилийн жагсаалт авах
    async function getYear () {
        setYear(generateLessonYear(10))
	}

    const toggle = () => setIsOpen(!isOpen)

    // Хадгалах
	async function onSubmit(cdata) {
        cdata['school'] = school_id
        const { success, errors } = await postFetch(groupApi.post(cdata))
        if(success) {
            reset()
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
            getProfession()
            getYear()

        },
        []
    )

    const handleShalguur = (checked, id) => {
        if (checked) {
            setShalguurId(id)
            setShalguurIds([...shalguurIds, id])
        } else {
            setShalguurId('')
            let checked_ids = [...shalguurIds]
            if (id === 1) {
                setHynaltToo({
                    all: '',
                    men: '',
                    women: ''
                })
            }

            if (id === 3) {
                setNasYear({
                    men: '',
                    women: ''
                })
            }

            let removeVal = checked_ids.findIndex(({ id }) => id == id)
            checked_ids.splice(removeVal, 1)
            setShalguurIds(checked_ids)
        }
    }

    const handleHutulbur = () => {
        var push_datas = {
            'profession': hutuburId,
            'checked_ids': setShalguurIds,
            'hynalt_too': hynaltToo,
            'nasYear': nasYear
        }
        setSubmitDatas([...submitDatas, push_datas])
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
                    <h5 className="modal-title">{t('Элсэлтийн бүртгэл')}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                    <Col md={6}>
                            <Label className="form-label" for="name">
                               {t('Элсэлтийн нэр')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="name"
                                render={({ field }) => (
                                    <Input
                                        id='name'
                                        placeholder='Элсэлтийн нэр'
                                        invalid={errors.name && true}
                                        {...field}
                                        bsSize="sm"
                                    />
                                )}
                            ></Controller>
                            {errors.name && <FormFeedback className='d-block'>{errors.name.message}</FormFeedback>}
                        </Col>
                        <Col md={6}>
                            <Label className="form-label" for="join_year">
                                {t('Хичээлийн жил')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="join_year"
                                name="join_year"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="profession"
                                            id="profession"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.profession })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={yearOption || []}
                                            value={value && yearOption.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            />
                            {errors.join_year && <FormFeedback className='d-block'>{errors.join_year.message}</FormFeedback>}
                        </Col>
                        <Col md={6}>
                            <Label className="form-label" for="start_date">
                                {t('Эхлэх хугацаа')}
                            </Label>
                            <Controller
                                defaultValue={new Date()}
                                control={control}
                                name='start_date'
                                className="form-control"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Flatpickr
                                            id='start_date'
                                            className='form-control'
                                            onChange={dates => {
                                                onChange(dates[0]);
                                            }}
                                            value={value}
                                            style={{height: "30px"}}
                                            options={{
                                                dateFormat: 'Y-m-d',
                                                utc: true,
                                            }}
                                        />
                                    )
                                }}
                            />
                            {errors.start_date && <FormFeedback className='d-block'>{t(errors.start_date.message)}</FormFeedback>}
                        </Col>
                        <Col md={6}>
                            <Label className="form-label" for="end_date">
                                {t('Дуусах хугацаа')}
                            </Label>
                            <Controller
                                defaultValue={new Date()}
                                control={control}
                                name='end_date'
                                className="form-control"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Flatpickr
                                            id='end_date'
                                            className='form-control'
                                            onChange={dates => {
                                                onChange(dates[0]);
                                            }}
                                            value={value}
                                            style={{height: "30px"}}
                                            options={{
                                                dateFormat: 'Y-m-d',
                                                utc: true,
                                            }}
                                        />
                                    )
                                }}
                            />
                            {errors.start_date && <FormFeedback className='d-block'>{t(errors.start_date.message)}</FormFeedback>}
                        </Col>
                        <Col xs={12} className='text-start'>
                            <Button size='sm' color='primary'  onClick={toggle}  className='mb-25'>Хөтөлбөр нэмэх</Button>
                        </Col>
                        <Col sm={12} md={12}>
                            <Collapse isOpen={isOpen}>
                                <Col md={6} className='mb-1'>
                                    <Label className="form-label" for="profession">
                                    {t('Хөтөлбөр')}
                                    </Label>
                                    <Select
                                        name="profession"
                                        id="profession"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select')}
                                        isLoading={isLoading}
                                        placeholder={t(`-- Сонгоно уу --`)}
                                        options={profOption || []}
                                        value={hutuburId && profOption.find((c) => c.id === hutuburId)}
                                        noOptionsMessage={() => t('Хоосон байна')}
                                        onChange={(val) => {
                                            setHutulburId(val?.id || '')
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.full_name}
                                    />
                                </Col>
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
                                            shalguurId == 2
                                            ?
                                                <Fragment>
                                                    <Row>
                                                        <Col className={4}>
                                                            <Label>Нийт тоо</Label>
                                                            <Input
                                                                type='number'
                                                                bsSize='sm'
                                                                value={hynaltToo.all}
                                                                onChange={(e) => setHynaltToo(current => {
                                                                    return {
                                                                        ...current,
                                                                        all: e.target.value
                                                                    }
                                                                })}
                                                                placeholder='Нийт тоо'
                                                            />
                                                        </Col>
                                                        <Col className={4}>
                                                            <Label>Эрэгтэй тоо</Label>
                                                            <Input
                                                                type='number'
                                                                bsSize='sm'
                                                                value={hynaltToo.men}
                                                                placeholder='Эрэгтэй тоо'
                                                                onChange={(e) => setHynaltToo(current => {
                                                                    return {
                                                                        ...current,
                                                                        men: e.target.value
                                                                    }
                                                                })}
                                                            />
                                                        </Col>
                                                        <Col className={4}>
                                                            <Label>Эмэгтэй тоо</Label>
                                                            <Input
                                                                type='number'
                                                                bsSize='sm'
                                                                placeholder='Эмэгтэй тоо'
                                                                value={hynaltToo.women}
                                                                onChange={(e) => setHynaltToo(current => {
                                                                    return {
                                                                        ...current,
                                                                        women: e.target.value
                                                                    }
                                                                })}
                                                            />
                                                        </Col>
                                                    </Row>
                                                </Fragment>
                                            :
                                                shalguurId === 3
                                                ?
                                                <Fragment>
                                                    <Row>
                                                        <Col className={4}>
                                                            <Label>Эрэгтэй он ... хойш</Label>
                                                            <Input
                                                                type='number'
                                                                bsSize='sm'
                                                                value={nasYear.men}
                                                                placeholder='Эрэгтэй он ... хойш'
                                                                onChange={(e) => setNasYear(current => {
                                                                    return {
                                                                        ...current,
                                                                        men: e.target.value
                                                                    }
                                                                })}
                                                            />
                                                        </Col>
                                                        <Col className={4}>
                                                            <Label>Эмэгтэй он ... хойш</Label>
                                                            <Input
                                                                type='number'
                                                                bsSize='sm'
                                                                placeholder='Эмэгтэй он ... хойш'
                                                                value={nasYear.women}
                                                                onChange={(e) => setNasYear(current => {
                                                                    return {
                                                                        ...current,
                                                                        women: e.target.value
                                                                    }
                                                                })}
                                                            />
                                                        </Col>
                                                    </Row>
                                                </Fragment>
                                                :
                                                ''
                                        }
                                    </Col>
                                </div>
                                <Col className='mt-50' md={4}>
                                    <Button size='sm' color='primary' onChange={handleHutulbur} type={'button'}>Хөтөлбөр хадгалах</Button>
                                </Col>
                            </Collapse>
                        </Col>
                        <Col md={12} className="mt-2">
                            <Button className="me-2" color="primary" type="submit" disabled={postLoading}>
                                {postLoading &&<Spinner size='sm' className='me-1'/>}
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" type="reset" outline  onClick={handleModal}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
	);
};
export default Addmodal;

import { ReactSelectStyles, convertDefaultValue } from "@utils"
import React, { Fragment, useState, useEffect } from 'react';
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { X } from "react-feather";
import { t } from 'i18next';

import {
    Row,
    Col,
    Label,
    Button,
    Modal,
    ModalBody,
    ModalHeader,
    FormFeedback,
    Spinner,
    Input,
    ModalFooter,
    Form
} from "reactstrap";

import classnames from "classnames";
import useLoader from "@hooks/useLoader";
import Select from 'react-select';
import useApi from "@hooks/useApi";
import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
    profession: Yup.string().nullable().trim().required('Хоосон байна'),
    elselt: Yup.string().nullable().trim().required('Хоосон байна'),
    gender: Yup.string().nullable().trim().required('Хоосон байна'),
    lesson: Yup.array().of(Yup.string().nullable().trim().required('Хоосон байна')).required('Хоосон байна'),
    value: Yup.string().nullable().trim().required('Хоосон байна'),
    addRate: Yup.string().nullable().trim().required('Хоосон байна'),
    totalElsegch: Yup.string().nullable().trim().required('Хоосон байна'),
});


export const SortModal = ({ open, handleModal, refreshDatas, editData }) => {
    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    );

    const genderValue = [
        { id: 1, name: 'Эрэгтэй' },
        { id: 2, name: 'Эмэгтэй' }
    ];

    const genderFalseValue = [{ id: 3, name: 'Бүгд' }]

    const { control, handleSubmit, reset, setValue, setError, getValues, watch, formState: { errors } } = useForm({
        resolver: yupResolver(validateSchema)
    });

    const [genderOption, setGenderOption] = useState(genderValue)
    const [elseltOption, setElseltOption] = useState([]);
    const [professionOption, setProfessionOption] = useState([]);
    const [lessonOption, setLessonOption] = useState([]);

    const [gender, setGender] = useState('');
    const [profession, setProfession] = useState('');
    const [elselt, setElselt] = useState('');
    const [isGender, setIsGender] = useState(true)

    const { Loader, isLoading, fetchData } = useLoader({});
    const { isLoading: postLoading, fetchData: postFetch } = useLoader({});
    const { isLoading: hynaltLoading, fetchData: hynaltFetch } = useLoader({});

    const elseltApi = useApi().elselt;
    const professionApi = useApi().elselt.profession
    const admissionLessionApi = useApi().settings.admissionlesson;
    const hynaltApi = useApi().elselt.hynalt;

    async function getAdmissionYear() {
        const { success, data } = await fetchData(elseltApi.getAll());
        if (success) {
            setElseltOption(data);
        }
    }

    async function getProfessionOption() {
        const { success, data } = await fetchData(professionApi.getList(elselt));
        if (success) {
            setProfessionOption(data);
        }
    }

    const getAdmissionLesson = async () => {
        const { success, data } = await fetchData(admissionLessionApi.get());
        if (success) {
            console.log(data)
            setLessonOption(data);
        }
    };

    const getHynaltNumber = async () => {
        const { success, data } = await hynaltFetch(hynaltApi.get(gender, profession));
        if (success) {
            setValue('value', data);
        }
    };

    const getHynaltIsGender = async () => {
        const { success, data } = await hynaltFetch(hynaltApi.getIsGender(profession));
        if (success) {
            setIsGender(data)
        }
    }

    useEffect(() => {
        getAdmissionYear();
        getProfessionOption();
        getAdmissionLesson();
    }, []);

    useEffect(() => {
        getProfessionOption()
    }, [elselt])

    useEffect(() => {
        if (profession && gender) {
            getHynaltNumber();
        }
    }, [gender, profession]);

    useEffect(() => {
        getHynaltIsGender();
    }, [profession])

    useEffect(() => {
        if (isGender === false) {
            setGenderOption(genderFalseValue);
        } else {
            setGenderOption(genderValue);
        }
    }, [isGender, profession]);

    async function onSubmit(cdata) {
        cdata = convertDefaultValue(cdata);

        const { success, errors } = await postFetch(hynaltApi.post(cdata));
        if (success) {
            reset();
            refreshDatas();
            handleModal();
        } else {
            for (let key in errors) {
                setError(key, { type: 'custom', message: errors[key][0] });
            }
        }
    }

    function handleTotalElsegch() {
        var addRate = getValues('addRate');
        var hynaltNumber = getValues('value');

        if (addRate && hynaltNumber) {
            let elsegchNumber = Math.ceil((hynaltNumber * addRate / 100) + hynaltNumber);
            setValue('totalElsegch', elsegchNumber);
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
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <ModalHeader
                        className='d-flex justify-content-between'
                        toggle={handleModal}
                        close={CloseBtn}
                    >
                        <h5 className="modal-title">{t('Элсэгчдийн ЭЕШ-ийн оноо эрэмбэлэх')}</h5>
                    </ModalHeader>
                    <ModalBody className="flex-grow-1 mb-2">
                        <Row className="gy-1 d-flex justify-content-center">
                            <Col md={5}>
                                <Label className="form-label" for="elselt">
                                    {t('Элсэлт')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="elselt"
                                    name="elselt"
                                    render={({ field: { value, onChange } }) => (
                                        <Select
                                            name="elselt"
                                            id="elselt"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.elselt })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={elseltOption || []}
                                            value={value && elseltOption.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                setElselt(val?.id)
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )}
                                />
                                {errors.elselt && <FormFeedback className='d-block'>{errors.elselt.message}</FormFeedback>}
                            </Col>
                            <Col md={5}>
                                <Label className="form-label" for="profession">
                                    {t('Мэргэжил')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="profession"
                                    name="profession"
                                    render={({ field: { value, onChange } }) => (
                                        <Select
                                            name="profession"
                                            id="profession"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.profession })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={professionOption || []}
                                            value={value && professionOption.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                setProfession(val?.id)
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )}
                                />
                                {errors.profession && <FormFeedback className='d-block'>{errors.profession.message}</FormFeedback>}
                            </Col>
                            <Col md={5}>
                                <Label className="form-label" for="gender">
                                    {t('Хүйс')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="gender"
                                    name="gender"
                                    render={({ field: { value, onChange } }) => (
                                        <Select
                                            name="gender"
                                            id="gender"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.gender })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={genderOption}
                                            value={genderOption.find((c) => c.id === value) || null}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '');
                                                setGender(val?.id);
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )}
                                />
                                {errors.gender && <FormFeedback className='d-block'>{errors.gender.message}</FormFeedback>}
                            </Col>
                            <Col md={5}>
                                <Label className="form-label" for="lesson">
                                    {t('Хичээл')}
                                </Label>
                                <Controller
                                    defaultValue={[]}
                                    control={control}
                                    id="lesson"
                                    name="lesson"
                                    render={({ field: { value, onChange } }) => (
                                        <Select
                                            isMulti
                                            name="lesson"
                                            id="lesson"
                                            classNamePrefix="select"
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.lesson })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={lessonOption || []}
                                            value={lessonOption.filter(option => value.includes(option.id))}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(selectedOptions) => onChange(selectedOptions ? selectedOptions.map(option => option.id) : [])}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.lesson_name}
                                        />
                                    )}
                                />
                                {errors.lesson && <FormFeedback className='d-block'>{errors.lesson.message}</FormFeedback>}
                            </Col>
                        </Row>
                        <Row className='mt-4 d-flex justify-content-center'>
                            <Col md={3}>
                                <Label className="form-label" for="value">
                                    {t('Хяналтын тоо')}
                                </Label>
                                <Controller
                                    control={control}
                                    defaultValue=''
                                    name="value"
                                    render={({ field }) => (
                                        <Input
                                            id='value'
                                            placeholder='Хяналтын тоо'
                                            {...field}
                                            bsSize="sm"
                                        />
                                    )}
                                ></Controller>
                                {errors.value && <FormFeedback className='d-block'>{errors.value.message}</FormFeedback>}
                            </Col>
                            <Col md={3}>
                                <Label className="form-label" for="addRate">
                                    {t('Нэмэгдүүлэх хувь')}
                                </Label>
                                <div style={{ position: 'relative' }}>
                                    <Controller
                                        control={control}
                                        defaultValue=''
                                        name="addRate"
                                        render={({ field }) => (
                                            <Input
                                                id='addRate'
                                                type='number'
                                                placeholder='Нэмэгдүүлэх хувь'
                                                {...field}
                                                bsSize="sm"
                                                style={{ paddingRight: '30px' }}
                                            />
                                        )}
                                    ></Controller>
                                    <span style={{
                                        position: 'absolute',
                                        top: '50%',
                                        right: '10px',
                                        transform: 'translateY(-50%)',
                                        pointerEvents: 'none'
                                    }}>%</span>
                                </div>
                                {errors.addRate && <FormFeedback className='d-block'>{errors.addRate.message}</FormFeedback>}
                            </Col>
                            <Col md={1}>
                                <Label>
                                    {t('Бодох')}
                                </Label>
                                <Button
                                    size='sm'
                                    className='mb-50'
                                    color='primary'
                                    onClick={handleTotalElsegch}
                                >
                                    <div className='d-flex justify-content-center align-items-center' style={{ fontSize: '1rem', fontWeight: 'bold' }}>=</div>
                                </Button>
                            </Col>
                            <Col md={3}>
                                <Label className="form-label" for="totalElsegch">
                                    {t('Тэнцүүлэх элсэгчийн тоо')}
                                </Label>
                                <Controller
                                    control={control}
                                    defaultValue=''
                                    name="totalElsegch"
                                    render={({ field }) => (
                                        <Input
                                            id='totalElsegch'
                                            placeholder='Элсэгчийн тоо'
                                            {...field}
                                            bsSize="sm"
                                            readOnly
                                        />
                                    )}
                                ></Controller>
                            </Col>
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        <div className='d-flex justify-content-center align-items-center'>
                            <Button className="me-2" color="primary" type="submit" disabled={postLoading}>
                                {postLoading && <Spinner size='sm' className='me-1' />}
                                {t('Эрэмбэлэх')}
                            </Button>
                            <Button color="secondary" onClick={handleModal}>
                                {t('Буцах')}
                            </Button>
                        </div>
                    </ModalFooter>
                </Form>
            </Modal>
        </Fragment>
    )
}

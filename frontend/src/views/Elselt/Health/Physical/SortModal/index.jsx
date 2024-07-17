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
    value: Yup.string().nullable().trim().required('Хоосон байна'),
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

    const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm({
        resolver: yupResolver(validateSchema)
    });

    // state option
    const [genderOption, setGenderOption] = useState(genderValue)
    const [elseltOption, setElseltOption] = useState([]);
    const [professionOption, setProfessionOption] = useState([]);

    // 
    const [gender, setGender] = useState('');
    const [profession, setProfession] = useState('');
    const [elselt, setElselt] = useState('');
    const [isGender, setIsGender] = useState(true)

    // loader
    const { Loader, isLoading, fetchData } = useLoader({});
    const { isLoading: postLoading, fetchData: postFetch } = useLoader({});
    const { isLoading: hynaltLoading, fetchData: hynaltFetch } = useLoader({});

    // api
    const elseltApi = useApi().elselt;
    const professionApi = useApi().elselt.profession
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

    const onSubmit = async (cdata) => {
        cdata = convertDefaultValue(cdata)

        const {success, errors} = await postFetch(hynaltApi.postPhysical(cdata))
        if (success) {
            reset()
            refreshDatas()
            handleModal()
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
                        <h5 className="modal-title">{t('Элсэгчдийн бие бялдарын оноо эрэмбэлэх')}</h5>
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
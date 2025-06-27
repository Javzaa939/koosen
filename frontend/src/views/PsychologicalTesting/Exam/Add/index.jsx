import React, {Fragment, useState, useContext, useEffect} from 'react'
import {validate, formatDate, convertDefaultValue} from "@utils"
import {useForm, Controller} from "react-hook-form";
import {X} from "react-feather";
import {t} from 'i18next';

import { useQuill } from 'react-quilljs';
import {
    Row,
    Col,
    Form,
    Modal,
    Label,
    Input,
    Button,
    Spinner,
    ModalBody,
    ModalHeader,
    FormFeedback,
} from "reactstrap";

import AuthContext from '@context/AuthContext'
import useLoader from "@hooks/useLoader";
import Flatpickr from 'react-flatpickr'
import useApi from "@hooks/useApi";
import moment from 'moment';
import * as Yup from 'yup';
import '@styles/react/libs/flatpickr/flatpickr.scss'
import 'quill/dist/quill.snow.css'

export const validateSchema = Yup.object().shape({
	title: Yup.string().trim().required('Хоосон байна'),
	start_date: Yup.string().trim().required('Хоосон байна'),
	end_date: Yup.string().trim().required('Хоосон байна'),
});


const Addmodal = ({ open, handleModal, refreshDatas, editData }) => {

    const sendDatas = {}

    // X Button
    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    const [value, defaultValue] = useState('');

    const { quill, quillRef } = useQuill({
        modules: {
            toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ align: [] }],

                    [{ list: 'ordered'}, { list: 'bullet' }],
                    [{ indent: '-1'}, { indent: '+1' }],

                    [{ size: ['small', false, 'large', 'huge'] }],
                    ['link'],

                    [{ color: [] }, { background: [] }],

                    ['clean'],
            ],
        },
        value: value,
        theme: 'snow',
        formats: [
            'header','bold', 'italic', 'underline', 'strike',
            'align', 'list', 'indent',
            'size',
            'link',
            'color', 'background',
            'clean',
        ],
        readOnly: false,
    });

    // Form, Loader, Context
    const {user} = useContext(AuthContext)
	const {isLoading: postLoading, fetchData: postFetch} = useLoader({});
    const {control, handleSubmit, reset, setValue, setError, getValues, formState: {errors}} = useForm(validate(validateSchema));

    // Picker States
    const [endPicker, setEndPicker] = useState(new Date())
    const [startPicker, setStartPicker] = useState(new Date())

    // API
    const psychologicalTestAPI = useApi().challenge.psychologicalTest

    // POST болон PUT
	async function onSubmit(cdata) {
        cdata['start_date'] = moment(startPicker).format('YYYY-MM-DD HH:mm:ss')
        cdata['end_date'] =  moment(endPicker).format('YYYY-MM-DD HH:mm:ss')
        cdata['created_by'] = user?.id
        cdata['description'] = quill?.root?.innerHTML
        cdata['test_type'] = cdata['test_type'] ? 2 : 1

        if (editData?.id) {
            cdata = convertDefaultValue(cdata)
            const formData = new FormData()

            for (let key in cdata) {
                formData.append(key, cdata[key])
            }
            const { success, errors } = await postFetch(psychologicalTestAPI.put(formData, editData?.id))
            if(success) {
                reset()
                refreshDatas()
                handleModal()
            } else {
                for (let key in errors) {
                    setError(key, { type: 'custom', message:  errors[key][0]});
                }
            }
        } else {
            for (const [key, value] of Object.entries(cdata)) {
                if (value !== '') {
                    sendDatas[key] = value;
                }
            }

            cdata = convertDefaultValue(sendDatas)
            const formData = new FormData()

            for (let key in cdata) {
                formData.append(key, cdata[key])
            }

            const { success, errors } = await postFetch(psychologicalTestAPI.post(formData))
            if(success) {
                reset()
                refreshDatas()
                handleModal()
            } else {
                for (let key in errors) {
                    setError(key, { type: 'custom', message:  errors[key][0]});
                }
            }
        }
	}

    useEffect(() => {
        if (Object.keys(editData).length > 0) {
            const fields = ['title', 'duration', 'description', 'test_type'];
            fields.forEach(field => {
                if (editData[field] !== null) {
                    if (field === 'test_type') {
                        if (editData[field] === 2) {
                            setValue(field, true);
                        } else {
                            setValue(field, false);
                        }
                    } else setValue(field, editData[field]);
                }
                if (field === 'description' && quill) {
                    quill.pasteHTML(editData[field]);
                }
            });
            if (editData?.start_date) {
                setStartPicker(editData?.start_date);
            }
            if (editData?.end_date) {
                setEndPicker(editData?.end_date);
            }

        }
    }, [editData, quill]);

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
                    className='d-flex justify-content-between'
                    toggle={handleModal}
                    close={CloseBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{t('Сэтгэлзүйн сорил нэмэх')}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1 d-flex" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={6}>
                            <Label className="form-label" for="title">
                               {t('Сорилын гарчиг')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="title"
                                render={({ field }) => (
                                    <Input
                                        id='title'
                                        placeholder='Сорилын гарчиг'
                                        invalid={errors.title && true}
                                        {...field}
                                        bsSize="sm"
                                    />
                                )}
                            ></Controller>
                            {errors.title && <FormFeedback className='d-block'>{errors.title.message}</FormFeedback>}
                        </Col>
                        <Col md={6}>
                            <Label className="form-label" for="duration">
                               {t('Үргэлжлэх хугацаа (заавал биш)')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="duration"
                                render={({ field }) => (
                                    <Input
                                        id='duration'
                                        placeholder='Минутаар'
                                        {...field}
                                        bsSize="sm"
                                        type='number'
                                    />
                                )}
                            ></Controller>
                        </Col>
                        <Col md={6}>
                            <Label className="form-label" for="start_date">
                                {t('Эхлэх хугацаа')}
                            </Label>
                            <Controller
                                defaultValue={formatDate(new Date())}
                                control={control}
                                name='start_date'
                                className="form-control"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Flatpickr
                                            id='start_date'
                                            className='form-control'
                                            onChange={dates => {
                                                onChange(formatDate(dates[0], 'YYYY-MM-DD H:M:S'));
                                                setStartPicker(dates[0])
                                            }}
                                            value={startPicker}
                                            style={{height: "30px"}}
                                            options={{
                                                dateFormat: 'Y-m-d H:i',
                                                enableTime: true,
                                                time_24hr: true,
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
                                defaultValue={formatDate(new Date())}
                                control={control}
                                name='end_date'
                                className="form-control"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Flatpickr
                                            id='end_date'
                                            className='form-control'
                                            onChange={dates => {
                                                onChange(formatDate(dates[0], 'YYYY-MM-DD HH:MM:SS'));
                                                setEndPicker(dates[0])
                                            }}
                                            value={endPicker}
                                            style={{height: "30px"}}
                                            options={{
                                                dateFormat: 'Y-m-d H:i',
                                                utc: true,
                                                time_24hr: true,
                                                enableTime: true,
                                                minDate: getValues("start_date"),
                                            }}
                                        />
                                    )
                                }}
                            />
                            {errors.start_date && <FormFeedback className='d-block'>{t(errors.start_date.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Controller
                                defaultValue={false}
                                control={control}
                                id='test_type'
                                name='test_type'
                                render={({ field }) => {
                                    return (
                                        <Input
                                            {...field}
                                            checked={field.value}
                                            className='me-50'
                                            type='checkbox'
                                            name='test_type'
                                            id='test_type'
                                        />
                                    )
                                }}
                            />
                            <Label className='form-label' for='test_type'>
                                {t('Сэтгэл зүйн сорил эсэх')}
                            </Label>
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="description">
                               {t('Тайлбар')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="description"
                                render={({field}) => (
                                    <div style={{ width: 'auto',}}>
                                        <div
                                            {...field}
                                            name='description'
                                            id='description'
                                            ref={quillRef}
                                        />
                                    </div>
                                )}
                            ></Controller>
                        </Col>
                        <Col md={12} className="mt-2 text-center">
                            <Button className="me-2" color="primary" type="submit" disabled={postLoading}>
                                {postLoading &&<Spinner size='sm' className='me-1'/>}
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" onClick={handleModal}>
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
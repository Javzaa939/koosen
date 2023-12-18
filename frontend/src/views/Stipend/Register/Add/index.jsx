import classNames from "classnames"
import { t } from "i18next"
import React, { Fragment, useState, useContext, useEffect } from 'react'
import Select from 'react-select'
import { ReactSelectStyles, convertDefaultValue } from "@utils"
import { useForm, Controller } from "react-hook-form";
import { X } from "react-feather";
import useLoader from "@hooks/useLoader";
import { validate } from "@utils"
import { validateSchema } from '../validateSchema';
import {
    Row,
    Col,
	Form,
	Modal,
    Input,
	Label,
    Button,
	ModalBody,
	ModalHeader,
	FormFeedback,
    Spinner
} from "reactstrap";
import useApi from "@hooks/useApi"
import ActiveYearContext from '@context/ActiveYearContext'
import { useQuill } from 'react-quilljs';
import 'react-quill/dist/quill.snow.css';

const Createmodal = ({ open, handleModal,refreshDatas }) => {
    const CloseBtn = (
        <X className="cursor-pointor" size={15} onClick={handleModal} />
    )
    //usecontext
    const { cyear_name, cseason_id} = useContext(ActiveYearContext)

    const { control, handleSubmit,reset, setError, formState: { errors } } = useForm(validate(validateSchema));

    const [value, setValue] = useState('');

    const {quill, quillRef } = useQuill({
        modules: {
            toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ align: [] }],

                    [{ list: 'ordered'}, { list: 'bullet' }],
                    [{ indent: '-1'}, { indent: '+1' }],

                    [{ size: ['small', false, 'large', 'huge'] }],
                    ['link', 'image',],

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
            'link', 'image',
            'color', 'background',
            'clean',
        ],
        readOnly: false,
    });
    // Loader
	const { isLoading, fetchData } = useLoader({});
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    //useState
    const [stipendOption, setStipendOption] = useState([])

    // Api
    const stipendApi = useApi().stipend.register
    const discountTypeApi = useApi().settings.discountType

    async function getDiscount() {
        const { success, data } = await fetchData(discountTypeApi.get())
        if(success) {
            setStipendOption(data)
        }
    }

    useEffect(() => {
        getDiscount()
    },[])

      const insertToEditor = (url) => {
        const range = quill.getSelection();
        quill.insertEmbed(range.index, 'image', url);
      };

      const saveToServer = async (file) => {
        const body = new FormData();
        body.append('file', file);

        const { success, data } = await fetchData(stipendApi.saveFile(body));
        if (success) {
          insertToEditor(data);
        }
      };

      const selectLocalImage = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = () => {
          const file = input.files[0];
          saveToServer(file);
        };
      };

    //submit darah ved ajillah
    async function onSubmit(cdata) {
        cdata['body'] = quill.root.innerHTML
        cdata['lesson_year'] = cyear_name
        cdata['lesson_season'] = cseason_id

        cdata = convertDefaultValue(cdata)

        const formData = new FormData()

        for (let key in cdata)
        {
            formData.append(key, cdata[key])
        }

        const { success, data, error } = await postFetch(stipendApi.post(formData))
        if (success) {
            reset()
            handleModal()
            refreshDatas()
        }
        else if (error)
        {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in error) {
                setError(error[key].field, { type: 'custom', message:  error[key].msg});
            }
        }
	    }

        useEffect(() => {
            if (quill) {
                quill.getModule('toolbar').addHandler('image', selectLocalImage);
        }
        }, [quill]);
        const [editorContent, setEditorContent] = useState('');

    return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className='sidebar-lg'
                modalClassName='modal-slide-in'
                contentClassName='pt-0'
                style={{maxWidth: '900px', width: '100%'}}>
                <ModalHeader
                    className="mb-1"
                    toggle={handleModal}
                    close={CloseBtn}
                    tag="div"
                >
                    <h4>{t('Тэтгэлгийн бүртгэл')}</h4>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className="form-label" for="stipend_type">
                                {t('Тэтгэлгийн төрөл')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="stipend_type"
                                render={({ field: { value, onChange } }) => {
                                    return (
                                        <Select
                                            name="stipend_type"
                                            id="stipend_type"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classNames('react-select', {'is-invalid': errors.stipend_type})}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={stipendOption || []}
                                            value={stipendOption.find((c) => c.id === value)}
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
                            {errors.stipend_type && <FormFeedback className='d-block'>{errors.stipend_type.message}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="body">
                                {t('Тайлбар')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                id="body"
                                name="body"
                                render={({field}) => (
                                    <div style={{ width: 'auto',}}>
                                        <div
                                            {...field}
                                            name='body'
                                            id='body'
                                            ref={quillRef}
                                        />
                                    </div>
                                )}
                            />
                            {errors.body && <FormFeedback className='d-block'>{errors.body.message}</FormFeedback>}

                        </Col>
                        <Col md={6}>
                            <Label className="form-label" for="start_date">
                                {t('Бүртгэл эхлэх хугацаа')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="start_date"
                                name="start_date"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="start_date"
                                        bsSize="sm"
                                        placeholder={t('Бүртгэл эхлэх хугацаа')}
                                        type="date"
                                        invalid={errors.start_date && true}
                                    />
                                )}
                            />
                            {errors.start_date && <FormFeedback className='d-block'>{errors.start_date.message}</FormFeedback>}
                        </Col>
                        <Col md={6}>
                            <Label className="form-label" for="finish_date">
                                {t('Бүртгэл дуусах хугацаа')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="finish_date"
                                name="finish_date"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="finish_date"
                                        bsSize="sm"
                                        placeholder={t('Бүртгэл дуусах хугацаа')}
                                        type="date"
                                        invalid={errors.finish_date && true}
                                    />
                                )}
                            />
                            {errors.finish_date && <FormFeedback className='d-block'>{errors.finish_date.message}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Controller
                                control={control}
                                id="is_open"
                                name="is_open"
                                defaultValue={false}
                                render={({ field }) => (
                                    <Input
                                        id="is_open"
                                        type="checkbox"
                                        className='me-50'
                                        {...field}
                                    />
                                )}
                            />
                            <Label className="form-label" for="is_open">
                                {t('Нээлттэй эсэх')}
                            </Label>
                        </Col>
                        <Col md={12} className="text-center mt-2">
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
    )
}
export default Createmodal;

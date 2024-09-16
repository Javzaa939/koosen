import React, { Fragment, useState, useEffect, useContext } from 'react'

import { X } from 'react-feather'

import { useQuill } from 'react-quilljs';

import 'quill/dist/quill.snow.css'

import '../style.css'

import { Controller, useForm } from 'react-hook-form'

import { convertDefaultValue, validate } from '@utils'

import { Modal, Row, Col, Label, ModalHeader, ModalBody, Form, Input, Button, FormFeedback,} from 'reactstrap'

import Select from 'react-select'

import { useTranslation } from 'react-i18next'

import useApi from '@hooks/useApi';

import useLoader from '@hooks/useLoader';

import { ReactSelectStyles, get_news_people_type, student_course_level } from "@utils"

import classnames from "classnames";

import AuthContext from '@context/AuthContext'

import SchoolContext from "@context/SchoolContext"

import { validateSchema } from '../validateSchema'

const Addmodal = ({ open, handleModal, refreshDatas }) => {

    const { user } = useContext( AuthContext)
    const { school_id } = useContext(SchoolContext)
    const { t } = useTranslation()

    const closeBtn = (
        <X className='cursor-pointer' size={15} onClick={handleModal} />)

    //  State
    const [value, setValue] = useState('');
    const [scopeOptions, setScopeOptions] = useState(get_news_people_type())
    const [student_levelOptions, setStudent_levelOptions] = useState(student_course_level())
    const [departmentOptions, setDepartmentOption] = useState([])
    const [isStudent, setStudent] = useState('')

    // Attachment
    const [is_new_upload_file, setUploadNewFile] = useState(false)
    const [featurefile, setFeaturedImg] = useState([])

    const {quill, quillRef } = useQuill({
        modules: {
            toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ align: [] }],

                    [{ list: 'ordered'}, { list: 'bullet' }],
                    [{ indent: '-1'}, { indent: '+1' }],

                    [{ size: ['small', false, 'large', 'huge'] }],
                    ['link',],

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

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false})

    // ** Hook
    const { control, handleSubmit, formState: { errors }, reset, setError } = useForm(validate(validateSchema));

    // Api
    const newsApi = useApi().service.news
    const departmentApi = useApi().hrms.department

    // Тэнхимийн жагсаалт
    async function getDepartmentOption() {
        const { success, data } = await fetchData(departmentApi.get(school_id))
        if(success) {
            setDepartmentOption(data)
        }
    }

    async function onSubmit(cdata)
    {
        cdata['body'] = quill.root.innerHTML
        cdata['created_user'] = user.id

        cdata = convertDefaultValue(cdata)

        const formData = new FormData()

        if(featurefile && featurefile.length > 0) {
            featurefile.forEach((file) => {
                if(is_new_upload_file) {
                    formData.append('image', file.file, file.file.name);
                }
                else {
                    formData.append('image', file.file);
                    if(file?.file_change) {
                        formData.append('image', file.file, file.file.name);
                    }
                    formData.append('file_change', file?.file_change || false);
                    formData.append('file_id', file?.id);
                }
                formData.append('descriptions', file.description);
            });
        }

        for (let key in cdata)
        {
            formData.append(key, cdata[key])
        }

        const { success, error } = await fetchData(newsApi.post(formData))
        if(success) {
            reset()
            refreshDatas()
            handleModal()
        }
        else {
            /** Алдааны мессеж */
            for (let key in error) {
                setError(error[key].field, { type: 'custom', message: error[key].msg});
            }
        }
    }

    const onChangeFile = (e, action) => {
        setUploadNewFile(true)

        //action 0 үед файлыг устгана.
        if (action === 0){
            setFeaturedImg([])
        } else {
            const selectedFile = e.target.files[0];

            //Хэрвээ оруулсан файлын төрөл image гэж эхэлсэн үед тус файлыг авна бусад үед алерт илгээнэ.
            if (selectedFile && selectedFile.type.startsWith('image/')){
                //Анхны удаа файл оруулхад ажилна.
                if (featurefile.length === 0){
                    if(action == 'Get_File') {
                        const files = Array.prototype.slice.call(e.target.files)
                        const hereFiles = [...featurefile]
                        files.map(file => {
                            if(file) hereFiles.push({file: file, description: file.name})
                        })
                        setFeaturedImg(hereFiles)
                    }
                //Оруулсан файлаа өөчлөх үед өмнөх файлыг устгаад нэмнэ.
                } else if (featurefile.length > 0 & action == 'Get_File'){
                    setFeaturedImg(featurefile.splice(0, 1))
                    const files = Array.prototype.slice.call(e.target.files)
                    const hereFiles = [...featurefile]
                    files.map(file => {
                        if(file) hereFiles.push({file: file, description: file.name})
                    })
                    setFeaturedImg(hereFiles)
                }
            } else {
                //алерт илгээгээд input-ээ хоосон утгатай болгоно.
                alert('Зөвхөн зураг оруулна уу.');
                e.target.value = '';
            }
        }
    }

    const insertToEditor = (url) => {
        const range = quill.getSelection();
        quill.insertEmbed(range.index, 'image', url);
    };

    async function saveToServer(file)  {
        const body = new FormData();
        body.append('file', file);

        const { success, data } = await fetchData(newsApi.saveFile(body))
        insertToEditor(data);
    };

    function selectLocalImage () {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = () => {
            const file = input.files[0];
            saveToServer(file);
        };
    };

    useEffect(() => {
        getDepartmentOption()
        if (quill) {
            quill.getModule('toolbar').addHandler('image', selectLocalImage);
    }
    }, [quill]);

    return (
        <Fragment>
            {Loader && isLoading}
             <Modal
                isOpen={open}
                toggle={handleModal}
                className="sidebar-xl hr-register"
                modalClassName="modal-slide-in "
                contentClassName="pt-0"
            >
                <ModalHeader
                    className="mb-1"
                    toggle={handleModal}
                    close={closeBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{t('Зар нэмэх')}</h5>
                </ModalHeader>
                <ModalBody className='flex-grow-1'>
                    <Row tag={Form} className='gy-1' onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className='form-label' for="title">
                                {t('Гарчиг')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='title'
                                name='title'
                                render={({field}) => (
                                    <Input
                                        {...field}
                                        type='text'
                                        name='title'
                                        id='title'
                                        placeholder={t('Гарчиг')}
                                        bsSize='sm'
                                        invalid={errors.title && true}
                                    />
                                )}
                            />
                            {errors.title && <FormFeedback className='d-block'>{t(errors.title.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className='form-label' for='body'>
                                {t('Зар байршуулах хэсэг')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='body'
                                name='body'
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
                            {errors.body && <FormFeedback className='d-block'>{t(errors.body.message)}</FormFeedback>}
                        </Col>
                        <Col md={12} >
                            <Label for='image'>
                                {t('Зарын зураг оруулах')}
                            </Label>
                            <Controller
								name='image'
								control={control}
								defaultValue=''
								render={({ field }) => {
									field.value = field.value ? field.value : ''
									return (
										<Input
											{...field}
											id='image'
											type="file"
											bsSize='sm'
                                            accept="image/*"
											onChange={(e) => onChangeFile(e, 'Get_File')}
										/>
									)
								}}
							/>
                        </Col>
                        <Col md={12} className='mt-50'>
                            {
                                featurefile.map((image, index) => {
                                    return (
                                        <div key={index}>
                                            {
                                                image.description || image?.file?.name
                                            }
                                            <X className='ms-50' role="button" color="red" size={15} onClick={(e) => onChangeFile(e, index)}></X>
                                        </div>
                                    )
                                })
                            }
                        </Col>
                        <Col md={12}>
                            <Label className='form-label' for="scope">
                                {t('Хамрах хүрээ')}
                            </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    name='scope'
                                    render={({field: { value, onChange }}) => {
                                        return (
                                            <Select
                                                name='scope'
                                                id='scope'
                                                classNamePrefix='select'
                                                isClearable
                                                className={classnames('react-select', { 'is-invalid': errors.scope })}
                                                isLoading={isLoading}
                                                placeholder={t('--Сонгоно уу--')}
                                                options={scopeOptions || []}
                                                value={scopeOptions.find((c) => c.id === value)}
                                                noOptionsMessage={() => t('Хоосон байна')}
                                                onChange={(val) => {
                                                    onChange(val?.id || '')
                                                    setStudent(val?.id || '')
                                                }}
                                                styles={ReactSelectStyles}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => option.name}
                                            />
                                        )
                                    }}
                                ></Controller>
                            {errors.scope && <FormFeedback className='d-block'>{t(errors.scope.message)}</FormFeedback>}
                        </Col>
                        {
                        isStudent === 1 &&
                            <Col md={12}>
                                <Label className='form-label' for="student_level">
                                    {t('Курс')}
                                </Label>
                                    <Controller
                                        defaultValue=''
                                        control={control}
                                        name='student_level'
                                        render={({field: { value, onChange }}) => {
                                            return (
                                                <Select
                                                    name='student_level'
                                                    id='student_level'
                                                    classNamePrefix='select'
                                                    isClearable
                                                    className={classnames('react-select', { 'is-invalid': errors.student_level })}
                                                    isLoading={isLoading}
                                                    placeholder={t('--Сонгоно уу--')}
                                                    options={student_levelOptions || []}
                                                    value={value && student_levelOptions.find((c) => c.id === value)}
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
                                    ></Controller>
                                    {errors.student_level && <FormFeedback className='d-block'>{t(errors.student_level.message)}</FormFeedback>}
                            </Col>
                        }
                        <Col md={12}>
                            <Label className='form-label' for="department">
                                {t('Тэнхим')}
                            </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    name='department'
                                    render={({field: { value, onChange }}) => {
                                        return (
                                            <Select
                                                name='department'
                                                id='department'
                                                classNamePrefix='select'
                                                isClearable
                                                className={classnames('react-select', { 'is-invalid': errors.department })}
                                                isLoading={isLoading}
                                                placeholder={t('--Сонгоно уу--')}
                                                options={departmentOptions || []}
                                                value={departmentOptions.find((c) => c.id === value)}
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
                                ></Controller>
                            {errors.department && <FormFeedback className='d-block'>{t(errors.department.message)}</FormFeedback>}
                        </Col>
                        <Col md={12} className="mt-2">
                            <Button className='me-2' color="primary" type="submit">
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" outline type="reset" onClick={handleModal}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
    )
}



export default Addmodal


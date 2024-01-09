import { Fragment, useEffect, useState, useContext } from "react"

import { t } from 'i18next';
import { X } from "react-feather";

import Select from 'react-select'

import classnames from "classnames";

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import ActiveYearContext from "@context/ActiveYearContext"
import AuthContext from "@context/AuthContext"

import { useForm, Controller } from "react-hook-form";

import { Row, Col, Form, Modal, Input, Label, Button, ModalBody, ModalHeader, FormFeedback, InputGroupText, InputGroup, Spinner } from "reactstrap";

import { ReactSelectStyles, get_correspond_type, validate, convertDefaultValue } from "@utils"

import AddTable from './Table'
import { validateSchema } from './validationSchema'

const Add = ({ open, handleModal, refreshDatas, datas, editId, isSolved }) => {

    const { user } = useContext(AuthContext)

    const { control, handleSubmit, reset, setValue, setError, formState: { errors } } = useForm(validate(validateSchema));

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={() => {handleModal(), reset()}} />
    )

    // Loader
	const { Loader, isLoading, fetchData } = useLoader({});
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    const { cseason_id, cyear_name } = useContext(ActiveYearContext)

    const [isEdit, setIsEdit] = useState(false)
    const [isDisabled, setDisabled] = useState(false)

    const [file, setFile] = useState(null)
    const [fileName, setFileName] = useState('')
    const [typeId, setTypeId] = useState('')

    const [rowDatas, setRowDatas] = useState([])
    const [corresDatas, setCorresDatas] = useState([])
    const [notCorresDatas, setNotCorresDatas] = useState([])
    const [degreeId, setDegree] = useState('')
    const [groupId, setGroupId] = useState('')

    const [professionId, setProfessionId] = useState('')

    const [ctypeOption, setTypeOption] = useState([])
    const [professionOption, setProfessionOption] = useState([])
    const [degreeOption, setDegreeOption] = useState([])
    const [lessonOption, setLessonOption] = useState([])
    const [oldLessonOption, setOldLessonOption] = useState([])
    const [groupOption, setGroupOption] = useState([])

    // API
    const professionApi = useApi().study.professionDefinition
    const degreeApi = useApi().settings.professionaldegree
    const correspondApi = useApi().request.correspond
    const groupApi = useApi().student.group
    const studentApi = useApi().student

    function getAll() {
        Promise.all(
            [
                fetchData(groupApi.getAllList()),
                fetchData(degreeApi.get()),
                fetchData(professionApi.getList(degreeId)),
            ]
        ).then((values) => {
            setGroupOption(values[0]?.data)
            setDegreeOption(values[1]?.data)
            setProfessionOption(values[2]?.data)
        })
    }

    async function onSubmit(cdata) {

        corresDatas.map((c) =>
        {
            delete c.full_name;
        })

        cdata['lesson_year'] = cyear_name
        cdata['lesson_season'] = cseason_id
        cdata['lessons'] = JSON.stringify(corresDatas)
        cdata['file_name'] = fileName
        cdata['student'] = datas?.id ? datas?.id : null

        cdata = convertDefaultValue(cdata)

        const formData = new FormData()
        if (file) {
            for (let key in cdata) {
                formData.append(key, cdata[key])
            }
            formData.append('file', file)
        } else {
            cdata['file'] = file
        }

        if (corresDatas.length > 0 || rowDatas.length > 0) {

            if (editId) {
                const { success, error } = await postFetch(correspondApi.put(file ? formData : cdata, editId))
                if (success) {
                    reset()
                    handleModal()
                    refreshDatas()
                } else {
                    /** Алдааны мессэжийг input дээр харуулна */
                    for (let key in error) {
                        setError(error[key].field, { type: 'custom', message: error[key].msg });
                    }
                }
            } else {
                const { success, error } = await postFetch(correspondApi.post(file ? formData : cdata))
                if (success) {
                    reset()
                    handleModal()
                    refreshDatas()
                } else {
                    /** Алдааны мессэжийг input дээр харуулна */
                    for (let key in error) {
                        setError(error[key].field, { type: 'custom', message: error[key].msg });
                    }
                }
            }
        }
    }

    // Шинэ мөр нэмж байгаа хэсэг
    const addRow = (datas) => {

        setRowDatas([...datas])

        // Дүйцсэн хичээлүүд
        var corres_lesson = datas.filter((c) => { if (c.score && c.learn_lesson) return c  })
        var not_corres_lesson = datas.filter((c) => { if (!c.learn_lesson) return c  })
        setCorresDatas([...corres_lesson])
        setNotCorresDatas([...not_corres_lesson])
    }

    const getFile = (e, action) => {
        if (action == 'Get') {
            var files = e.target.files
            setFile(files[0])
            setFileName(files[0]?.name)
        } else {
            const dt = new DataTransfer()
            const input = document.getElementById('file')
            const { files } = input

            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                if (0 !== i) dt.items.add(file)
            }

            input.files = dt.files
            setFile(null)
            setFileName('')

        }
    }

    useEffect(() => {
        if (Object.keys(user).length > 0 && !user.permissions.includes('lms-request-correspond-update')) {
            setDisabled(true)
        }
    }, [user])

    useEffect(() => {
        if (Object.keys(datas).length > 0) {
            for(let key in datas) {
                if (datas[key] !== null) {
                    setValue(key, datas[key])
                } else {
                    setValue(key, '')
                }
                setIsEdit(!isEdit)

                if (key === 'file') {
                    setFile(datas[key])
                }
                if (key === 'file_name') {
                    setFileName(datas[key])
                }

                if (key === 'correspondlessons' && datas[key].length > 0) {
                    setRowDatas(datas[key])
                }
                if (key === 'group') {
                    setValue('student_group', datas[key]?.id)
                }
                if (key === 'correspond_type') {
                    setTypeId(datas[key])
                    setValue('correspond_type', datas[key])
                }

                if (key === 'profession') {
                    setProfessionId(datas[key])
                }

                if (key === 'now_group') {
                    setProfessionId(datas[key]?.profession?.id)
                    setValue('degree', datas[key]?.profession?.degree)
                    setValue('profession', datas[key]?.profession?.id)
                    setValue('group', datas[key]?.id)
                    setGroupId(datas[key]?.id)
                }
            }
        }
    }, [datas])

    useEffect(() => {
        setTypeOption(get_correspond_type())
        getAll()
    }, [professionId, editId])


    async function getGroupLessons() {
        const { success, data } = await groupApi.getLesson(groupId)
        if (success) {
            if (datas?.correspondlessons?.length === 0) {
                setRowDatas(data)
            }
            setLessonOption(data)
        }
    }

    async function getOldGroupLessons() {
        const { success, data } = await studentApi.getLessonStudent(datas?.id)
        if (success) {
            setOldLessonOption(data)
        }
    }

    useEffect(() => {
        if (groupId) {
            getGroupLessons()
        }
    }, [groupId])


    useEffect(() => {
        if (datas?.id) {
            getOldGroupLessons(datas?.id)
        }
    }, [datas])

    return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className="sidebar-xl hr-register"
                modalClassName="modal-slide-in "
                contentClassName="pt-0"
                style={{ width: '1000px'}}
            >
                <ModalHeader
                    className="mb-1"
                    toggle={handleModal}
                    close={CloseBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{editId?  file? t('Дүнгийн дүйцүүлэлт хийх хүсэлт засах') : t('Дүнгийн дүйцүүлэлт хийх хүсэлт үүсгэх') : t('Дүнгийн дүйцүүлэлт хийх хүсэлт үүсгэх')}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={6} sm={12}>
                            <Label for="last_name">{t('Овог')}</Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="last_name"
                                render={({ field }) => {
                                    return (
                                        <Input
                                            {...field}
                                            id="last_name"
                                            bsSize="sm"
                                            type="text"
                                            placeholder="Овог"
                                            disabled={isDisabled}
                                            invalid={errors.last_name && true}
                                        />
                                    )
                                }}
                            />
                            {errors.last_name && <FormFeedback className='d-block'>{errors.last_name.message}</FormFeedback>}
                        </Col>
                        <Col md={6} sm={12}>
                            <Label for="first_name">{t('Нэр')}</Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="first_name"
                                render={({ field }) => {
                                    return (
                                        <Input
                                            {...field}
                                            id="first_name"
                                            bsSize="sm"
                                            type="text"
                                            disabled={isDisabled}
                                            placeholder="Нэр"
                                            invalid={errors.first_name && true}
                                        />
                                    )
                                }}
                            />
                            {errors.first_name && <FormFeedback className='d-block'>{errors.first_name.message}</FormFeedback>}
                        </Col>
                        <Col md={6} sm={12} className='mt-1'>
                            <Label for="register_num">{t('Регистрийн дугаар')}</Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="register_num"
                                render={({ field }) => {
                                    return (
                                        <Input
                                            {...field}
                                            id="register_num"
                                            bsSize="sm"
                                            type="text"
                                            disabled={isDisabled}
                                            placeholder="Регистрийн дугаар"
                                            invalid={errors.register_num && true}
                                        />
                                    )
                                }}
                            />
                            {errors.register_num && <FormFeedback className='d-block'>{errors.register_num.message}</FormFeedback>}
                        </Col>
                        <Col md={6} sm={12} className='mt-1'>
                            <Label for="phone">{t('Утасны дугаар')}</Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="phone"
                                render={({ field }) => {
                                    return (
                                        <Input
                                            {...field}
                                            id="phone"
                                            bsSize="sm"
                                            disabled={isDisabled}
                                            type="number"
                                            placeholder="Утасны дугаар"
                                            invalid={errors.phone && true}
                                        />
                                    )
                                }}
                            />
                            {errors.phone && <FormFeedback className='d-block'>{errors.phone.message}</FormFeedback>}
                        </Col>
                        <Col md={6} sm={12} className='mt-1'>
                            <Label for="correspond_type">{t('Дүйцүүлэлтийн төрөл')}</Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="correspond_type"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="correspond_type"
                                            id="correspond_type"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.correspond_type })}
                                            isLoading={isLoading}
                                            isDisabled={isDisabled}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={ctypeOption || []}
                                            value={ctypeOption.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                setTypeId(val?.id)
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            />
                            {errors.correspond_type && <FormFeedback className='d-block'>{errors.correspond_type.message}</FormFeedback>}
                        </Col>
                        {
                            typeId === 3 &&
                            <>
                                <Col md={6} sm={12}>
                                    <Label for="student_group">{t('Сурч байсан анги')}</Label>
                                    <Controller
                                        control={control}
                                        defaultValue=''
                                        name="student_group"
                                        render={({ field: { value, onChange} }) => {
                                            return (
                                                <Select
                                                    name="student_group"
                                                    id="student_group"
                                                    classNamePrefix='select'
                                                    isClearable
                                                    className={classnames('react-select', { 'is-invalid': errors.student_group })}
                                                    isLoading={isLoading}
                                                    isDisabled={isDisabled}
                                                    placeholder={t(`-- Сонгоно уу --`)}
                                                    options={groupOption || []}
                                                    value={groupOption.find((c) => c.id === value)}
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
                                </Col>
                            </>
                        }
                        <Col md={6} sm={12} className='mt-1'>
                            <Label for="file">{t('Хавсралт файл')}</Label>
                            <InputGroup>
                                <Input
                                    id='file'
                                    type='file'
                                    disabled={isDisabled}
                                    bsSize='sm'
                                    onChange={(e) => getFile(e, 'Get')}
                                />
                                {file
                                    &&
                                    <InputGroupText size="sm">
                                        <X role="button" color="red" size={15} onClick={(e) => getFile(e, 'Delete')}/>
                                    </InputGroupText>
                                }
                            </InputGroup>
                            {
                            fileName &&
                                <p className="mb-0" style={{fontSize: '12px'}}>
                                    <b className="me-1">Файл нэр: </b>{fileName}
                                </p>
                            }
                        </Col>
                        <Col md={6} sm={12} className='mt-1'>
                            <Label for="cause">{t('Тайлбар')}</Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="cause"
                                render={({ field }) => {
                                    return (
                                        <Input
                                            {...field}
                                            id="cause"
                                            disabled={isDisabled}
                                            bsSize="sm"
                                            type="textarea"
                                        />
                                    )
                                }}
                            />
                        </Col>
                        <Col md={4} sm={12} className='mt-1'>
                            <Label for="degree">{t('Боловсролын зэрэг')}</Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="degree"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="degree"
                                            id="degree"
                                            classNamePrefix='select'
                                            isClearable
                                            isDisabled={isDisabled}
                                            className={classnames('react-select', { 'is-invalid': errors.degree })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={degreeOption || []}
                                            value={degreeOption.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                setDegree(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.degree_name}
                                        />
                                    )
                                }}
                            />
                        </Col>
                        <Col md={4} sm={12} className='mt-1'>
                            <Label for="profession">{t('Хөтөлбөр')}</Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="profession"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="profession"
                                            id="profession"
                                            classNamePrefix='select'
                                            isClearable
                                            isDisabled={isDisabled}
                                            className={classnames('react-select', { 'is-invalid': errors.profession })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={professionOption || []}
                                            value={professionOption.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                setProfessionId(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.full_name}
                                        />
                                    )
                                }}
                            />
                            {errors.profession && <FormFeedback className='d-block'>{errors.profession.message}</FormFeedback>}
                        </Col>
                        <Col md={4} sm={12} className='mt-1'>
                            <Label for="group">{t('Анги')}</Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="group"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="group"
                                            id="group"
                                            classNamePrefix='select'
                                            isClearable
                                            isDisabled={isDisabled}
                                            className={classnames('react-select', { 'is-invalid': errors.group })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={groupOption || []}
                                            value={groupOption.find((c) => c.id === (value || groupId))}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                setGroupId(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            />
                            {errors.group && <FormFeedback className='d-block'>{errors.group.message}</FormFeedback>}
                        </Col>
                        <Col md={12} sm={12} className='mt-1'>
                            <AddTable datas={rowDatas} setDatas={setRowDatas} lessonOption={lessonOption} isDisabled={isDisabled} isSolved={isSolved} oldLessonOption={oldLessonOption} addRow={addRow} editId={editId}/>
                        </Col>
                        {
                            corresDatas.length > 0 && !editId
                            &&
                            <Row>
                                <Col md={6} sm={12} className='mt-1'>
                                    <div>
                                        <p className="fw-bolder">{`Нийт ${rowDatas.length} хичээлээс ${corresDatas.length} хичээл дүйцэж байна`}</p>
                                    </div>
                                    <div>
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th scope="col">Дүйцсэн хичээл</th>
                                                    <th scope="col">Дүйцүүлсэн хичээл</th>
                                                    <th scope="col">Дүн</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    corresDatas.map((c, idx) =>
                                                        <tr key={idx}>
                                                            <td>{c.full_name}</td>
                                                            <td>{c.learn_lesson}</td>
                                                            <td>{c.score}</td>
                                                        </tr>
                                                    )
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </Col>
                                <Col md={6} sm={12} className='mt-1'>
                                    <div>
                                        <p className="fw-bolder">{`Дүйцээгүй ${rowDatas.length - corresDatas.length} хичээл байна`}</p>
                                    </div>
                                    <div>
                                        {
                                            notCorresDatas.map((c, cidx) =>
                                                <li key={cidx}>
                                                    {c.name}
                                                </li>
                                            )
                                        }
                                    </div>
                                </Col>
                            </Row>
                        }
                        <Col md={12} className="mt-2">
                            <Button className="me-2" color="primary" type="submit" disabled={isDisabled || postLoading}>
                                {postLoading && <Spinner size='sm'/>}
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

export default Add

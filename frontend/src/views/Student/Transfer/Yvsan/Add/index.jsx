// ** React imports
import React, { Fragment, useState, useEffect, useContext } from 'react'

import Select from 'react-select'

import useApi from "@hooks/useApi";

import useLoader from "@hooks/useLoader";

import SchoolContext from "@context/SchoolContext";
import ActiveYearContext from "@context/ActiveYearContext";

import { ReactSelectStyles, convertDefaultValue } from "@utils"

import classnames from "classnames";

import { useTranslation } from "react-i18next";

import { X } from "react-feather";

import { useForm, Controller } from "react-hook-form";

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
    Container,
    Spinner
} from "reactstrap";

import { validate } from "@utils"

import { validateSchema } from '../validateSchema';


const Createmodal = ({ open, handleModal, refreshDatas, edit_id }) => {

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    const { control, handleSubmit, reset,  setError, setValue, formState: { errors } } = useForm(validate(validateSchema));

    const { school_id } = useContext(SchoolContext)
    // states
    const [is_loading, setLoader] = useState(false)
    const { cyear_name, cseason_id } =useContext(ActiveYearContext)

    const [school_checked, setSchoolChecked] = useState(false)

    const { t } = useTranslation()

    const [ schoolOption, setSchoolOption] = useState([]);
    const [ studentOption, setStudentOption] = useState([]);
    const [ selectedValue, setSelectedValue] = useState(null);
    const [ selectedDep, setSelectedDep] = useState(null);
    const [ selectedPro, setSelectedPro] = useState(null);
    const [ selectedGroup, setSelectedGroup] = useState(null);
    const [ studentInfo, setStudentInfo ] = useState({})
	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});

    const studentApi = useApi().student
    const schoolApi = useApi().survey.surveyrange;
    const studentmovementApi = useApi().student.movement

    // Сургуулийн жагсаалт
    async function getSchoolOption() {
        setLoader(true)
        const { success, data } = await fetchData(schoolApi.get('student', 'is_org'))
        if(success) {
            setLoader(false)
            setSchoolOption(data)
        }
    }

    // Сургуулийн жагсаалт
    async function getStudentOption() {
        if(!edit_id){
            const { success, data } = await fetchData(studentApi.getList())
            if(success) {
                setStudentOption(data)
            }
        }
    }

    useEffect(()=>{
        getSchoolOption()
        getStudentOption()
    },[])

	async function onSubmit(cdata) {
        cdata['is_internal'] = school_checked
        cdata['school'] = school_id
        cdata['lesson_year'] = cyear_name
        cdata['lesson_season'] = cseason_id
        cdata['group'] = selectedGroup? selectedGroup.id : ''
        if(edit_id){
            if(!school_checked){
                cdata['destination_school'] = ''
                cdata['group'] = ''
            }
            cdata['student'] = studentInfo?.student.id
            cdata = convertDefaultValue(cdata)
            const { success, errors } = await fetchData(studentmovementApi.put(cdata, studentInfo.id))
            if(success){
                reset()
                handleModal()
                refreshDatas()
            } else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in errors) {
                    setError(key, { type: 'custom', message: errors[key][0]});
                }
            }
        } else {
            const { success, errors } = await fetchData(studentmovementApi.post(cdata))
            if(success) {
                reset()
                handleModal()
                refreshDatas()
            } else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in errors) {
                    setError(key, { type: 'custom', message:  errors[key][0]});
                }
            }
        }
	}

    useEffect(() => {
        getDatas()
    },[open, edit_id, schoolOption])

    async function getDatas() {
        if(edit_id) {
            const { success, data } = await fetchData(studentmovementApi.getOne(edit_id))
            if(success) {
                setStudentInfo(data)
                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                if(data === null) return
                for(let key in data) {
                    if(data[key] !== null)
                        setValue(key, data[key])
                    else
                        setValue(key,'')
                    if(key === 'student') {
                        setValue(key, data.full_name)
                    }
                    if(key === 'is_internal') {
                        setSchoolChecked(data[key])
                    }
                    if(key === 'destination_school'){
                        var school = schoolOption.find((val) => {
                            return val.id === data[key]
                        })
                        setSelectedValue(school)
                    }
                    if(key === 'school_dep' && data.group){
                        var school = schoolOption.find((val) => {
                            return val.id === data.school_dep.school_id
                        })
                        setSelectedValue(school)
                        var dep = school?.children.find((val) => {
                            return val.id === data.school_dep.dep_id
                        })
                        setSelectedDep(dep)
                        var pro = dep?.children.find((val) => {
                            return val.id === data.school_dep.pro_id
                        })
                        setSelectedPro(pro)
                        var group = pro?.children.find((val) => {
                            return val.id === data.school_dep.group_id
                        })
                        setSelectedGroup(group)
                    }
                }
            }
        }
    }

	return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className='sidebar-lg'
                modalClassName='modal-slide-in'
                contentClassName='pt-0'
            >
                {edit_id?
                <ModalHeader
                    className="mb-1"
                    toggle={handleModal}
                    close={CloseBtn}
                    tag="div"
                    >
                <h4>{t('Шилжилт хөдөлгөөн засах')}</h4>
                </ModalHeader>
                :
                <ModalHeader
                    className="mb-1"
                    toggle={handleModal}
                    close={CloseBtn}
                    tag="div"
                    >
                <h4>{t('Шилжилт хөдөлгөөн бүртгэх')}</h4>
                </ModalHeader>
                }
                <ModalBody className="flex-grow-1">
                    {
                        is_loading &&
                            <div className='suspense-loader'>
                                <Spinner size='bg'/>
                                <span className='ms-50'>{t('Түр хүлээнэ үү...')}</span>
                            </div>
                    }
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        {
                        edit_id ?
                            <Col md={12}>
                                <Label className="form-label" for="student">
                                    {t('Оюутны мэдээлэл')}
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="student"
                                    name="student"
                                    render={({ field }) => (
                                        <Input
                                            id ="student"
                                            bsSize="sm"
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            disabled={edit_id}
                                            {...field}
                                            type="text"
                                            invalid={errors.student && true}
                                        />
                                    )}
                                />
                                {errors.student && <FormFeedback className='d-block'>{t(errors.student.message)}</FormFeedback>}
                            </Col>
                        :
                            <Col md={12}>
                                <Label className="form-label" for="student">
                                    {t('Оюутны мэдээлэл')}
                                </Label>
                                <Controller
                                    control={control}
                                    defaultValue=''
                                    name="student"
                                    render={({ field: { value, onChange} }) => {
                                        return (
                                            <Select
                                                name="student"
                                                id="student"
                                                classNamePrefix='select'
                                                isClearable
                                                className={classnames('react-select', { 'is-invalid': errors.student })}
                                                isLoading={isLoading}
                                                placeholder={t(`-- Сонгоно уу --`)}
                                                options={studentOption || []}
                                                value={studentOption.find((c) => c.id === value)}
                                                noOptionsMessage={() => t('Хоосон байна')}
                                                onChange={(val) => {
                                                    onChange(val?.id || '')
                                                }}
                                                styles={ReactSelectStyles}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => option.full_name}
                                            />
                                        )
                                    }}
                                ></Controller>
                                {errors.student && <FormFeedback className='d-block'>{errors.student.message}</FormFeedback>}
                            </Col>
                        }
                        {/* <Col md={12}>
                            <Label className="form-label" for="statement">
                                {t('Тушаал')}
                            </Label>
                            <Controller
                            defaultValue=''
                            control={control}
                            id="statement"
                            name="statement"
                            render={({ field }) => (
                                <Input
                                    id ="statement"
                                    bsSize="sm"
                                    placeholder={t('Тушаалын дугаар оруулна уу...')}
                                    {...field}
                                    type="text"
                                    invalid={errors.statement && true}
                                />
                            )}
                        />
                        {errors.statement && <FormFeedback className='d-block'>{t(errors.statement.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="statement_date">
                                {t('Тушаалын огноо')}
                            </Label>
                            <Controller
                                defaultValue=''
                                name='statement_date'
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        bsSize='sm'
                                        id='statement_date'
                                        placeholder='Сонгох'
                                        type="date"
                                        invalid={errors.statement_date && true}
                                    />
                                )}
                            />
                            {errors.statement_date && <FormFeedback className='d-block'>{t(errors.statement_date.message)}</FormFeedback>}
                        </Col> */}
                        <Col md={12}>
                            <Label className="form-label" for="description">
                                {t('Тайлбар')}
                            </Label>
                            <Controller
                            defaultValue=''
                            control={control}
                            id="description"
                            name="description"
                            render={({ field }) => (
                                <Input
                                    id ="description"
                                    bsSize="sm"
                                    placeholder={t('Тайлбараа бичнэ үү...')}
                                    {...field}
                                    type="text"
                                    invalid={errors.description && true}
                                />
                            )}
                        />
                        {errors.description && <FormFeedback className='d-block'>{t(errors.description.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Controller
                                control={control}
                                id="is_internal"
                                name="is_internal"
                                defaultValue={school_checked}
                                render={({ field: { value, onChange, checked } }) => (
                                    <Input
                                        className='me-50'
                                        // {...field}
                                        id="is_internal"
                                        type="checkbox"
                                        onChange={(e) =>
                                            {
                                                onChange(e.target.checked)
                                                setSchoolChecked(e.target.checked)
                                            }
                                        }
                                        checked={school_checked}
                                        value={school_checked}
                                    />
                                )}
                            />
                            <Label className="form-label pe-1" for="is_internal">
								{t('Сургууль дотор шилжих эсэх')}
                            </Label>
                        </Col>
                        {
                            school_checked &&
                                <Container>
                                    <Col md={12} className='mt-1'>
                                        <Label className="form-label " for="destination_school">
                                            {t('Сургууль')}
                                        </Label>
                                        <Controller
                                            control={control}
                                            defaultValue={studentInfo.school_dep?.school_id}
                                            name="destination_school"
                                            render={({ field: { value, onChange} }) => {
                                                return (
                                                    <Select
                                                        name="destination_school"
                                                        id="destination_school"
                                                        classNamePrefix='select'
                                                        isDisabled={selectedDep}
                                                        isClearable
                                                        className={classnames('react-select', { 'is-invalid': errors.destination_school })}
                                                        isLoading={isLoading}
                                                        placeholder={t(`Та салбар сургуулиа сонгоно уу`)}
                                                        options={schoolOption || []}
                                                        value={schoolOption.find((val) => val.id === value)}
                                                        noOptionsMessage={() => t('Хоосон байна')}
                                                        onChange={(val) => {
                                                            onChange(val?.id || '')
                                                            setSelectedValue(val)
                                                        }}
                                                        styles={ReactSelectStyles}
                                                        getOptionValue={(option) => option.id}
                                                        getOptionLabel={(option) => option.name}
                                                    />
                                                )
                                            }}
                                        ></Controller>
                                        {errors.destination_school && <FormFeedback className='d-block'>{errors.destination_school.message}</FormFeedback>}
                                    </Col>
                                    <Col md={12} className='mt-1'>
                                        <Label className="form-label mb-0" for="destination_department">
                                            {t('Хөтөлбөр')}
                                        </Label>
                                        <Controller
                                            control={control}
                                            defaultValue={studentInfo?.school_dep?.dep_id}
                                            name="destination_department"
                                            render={({ field: { value, onChange} }) => {
                                                return (
                                                    <Select
                                                        name="destination_department"
                                                        id="destination_department"
                                                        classNamePrefix='select'
                                                        isDisabled={selectedPro}
                                                        isClearable={!selectedPro}
                                                        className={classnames('react-select', { 'is-invalid': errors.destination_department})}
                                                        isLoading={isLoading}
                                                        placeholder={t(`Та хөтөлбөрийн багаа сонгоно уу`)}
                                                        options={selectedValue?.children}
                                                        value={selectedValue?.children.find((val) => val.id === value)}
                                                        noOptionsMessage={() => t('Хоосон байна')}
                                                        onChange={(val) => {
                                                            onChange(val?.id || '')
                                                            setSelectedDep(val)
                                                        }}
                                                        styles={ReactSelectStyles}
                                                        getOptionValue={(option) => option.id}
                                                        getOptionLabel={(option) => option.name}
                                                        />
                                                        )
                                            }}
                                        ></Controller>
                                        {errors.destination_department && <FormFeedback className='d-block'>{errors.destination_department.message}</FormFeedback>}
                                    </Col>
                                    <Col md={12} className='mt-1'>
                                        <Label className="form-label mb-0" for="destination_pro">
                                            {t('Мэргэжил')}
                                        </Label>
                                        <Controller
                                            control={control}
                                            defaultValue={studentInfo?.school_dep?.pro_id}
                                            name="destination_pro"
                                            render={({ field: { value, onChange} }) => {
                                                return (
                                                    <Select
                                                        name="destination_pro"
                                                        id="destination_pro"
                                                        classNamePrefix='select'
                                                        isDisabled={selectedGroup}
                                                        isClearable={!selectedGroup}
                                                        className={classnames('react-select', { 'is-invalid': errors.destination_pro})}
                                                        isLoading={isLoading}
                                                        placeholder={t(`Та мэргэжлээ сонгоно уу`)}
                                                        options={selectedDep?.children}
                                                        value={selectedDep?.children.find((val) => val.id === value)}
                                                        noOptionsMessage={() => t('Хоосон байна')}
                                                        onChange={(val) => {
                                                            onChange(val?.id || '')
                                                            setSelectedPro(val)
                                                        }}
                                                        styles={ReactSelectStyles}
                                                        getOptionValue={(option) => option.id}
                                                        getOptionLabel={(option) => option.name}
                                                        />
                                                        )
                                            }}
                                        ></Controller>
                                        {errors.destination_pro && <FormFeedback className='d-block'>{errors.destination_pro.message}</FormFeedback>}
                                    </Col>
                                    <Col md={12} className='mt-1'>
                                        <Label className="form-label mb-0" for="destination_group">
                                            {t('Анги')}
                                        </Label>
                                        <Controller
                                            control={control}
                                            defaultValue={studentInfo?.school_dep?.group_id}
                                            name="destination_group"
                                            render={({ field: { value, onChange} }) => {
                                                return (
                                                    <Select
                                                        name="destination_group"
                                                        id="destination_group"
                                                        classNamePrefix='select'
                                                        isClearable
                                                        className={classnames('react-select', { 'is-invalid': errors.destination_group})}
                                                        isLoading={isLoading}
                                                        placeholder={t(`Та ангиа сонгоно уу`)}
                                                        options={selectedPro?.children}
                                                        value={selectedPro?.children.find((val) => val.id === value)}
                                                        noOptionsMessage={() => t('Хоосон байна')}
                                                        onChange={(val) => {
                                                            onChange(val?.id || '')
                                                            setSelectedGroup(val)
                                                        }}
                                                        styles={ReactSelectStyles}
                                                        getOptionValue={(option) => option.id}
                                                        getOptionLabel={(option) => option.name}
                                                        />
                                                        )
                                            }}
                                        ></Controller>
                                        {errors.destination_group && <FormFeedback className='d-block'>{errors.destination_group.message}</FormFeedback>}
                                    </Col>
                                </Container>
                        }
                        <Col md={12} className="text-center mt-2">
                            <Button className="me-2" color="primary" type="submit">
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
export default Createmodal;

// ** React imports
import React, { Fragment, useState, useEffect, useContext } from 'react'

import Select from 'react-select'

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import { ReactSelectStyles } from "@utils"

import classnames from "classnames";

import { useForm, Controller } from "react-hook-form";

import {
    Row,
    Col,
	Form,
	Modal,
	Label,
	Button,
	ModalBody,
	ModalHeader,
	FormFeedback,
} from "reactstrap";

import { validate, convertDefaultValue } from "@utils"

import { t } from 'i18next';
import SchoolContext from "@context/SchoolContext"

import { validateSchema } from '../validateSchema';

const GroupEditScore = ({ open, handleModal, rowData }) => {

    const { school_id } = useContext(SchoolContext)

    const [group_option, setGroup] = useState([])
    const [selectedKurs, setSelectedKurs] = useState('')
    const [selectGroups, setSelectGroups] = useState([])
    const [student_levelOptions, setStudent_levelOptions] = useState([])

    const [lesson_search_value, setLessonSearchValue] = useState([]);
    const [ lesson_option, setLessonOption] = useState([])
    const [scrollLessonDatas, setScrollLessonDatas] = useState([]);
    const [bottomLessoncheck, setBottomLessonCheck] = useState(3)

    // ** Hook
    const { control, handleSubmit, setError, resetField, formState: { errors } } = useForm(validate(validateSchema));

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: true });
	const { isLoading: isLessonLoading, fetchData: lessonFetchData } = useLoader({ isFullScreen: true });

    // Api
    const lessonStandartApi = useApi().study.lessonStandart

    // Тухайн хичээл дээр дүн нь гарсан анги, курсын жагсаалт
    async function getGroupDatas(lesson) {
        const { success, data } = await fetchData(lessonStandartApi.getGroup(lesson, ''))
        if(success) {
            setGroup(data?.groups)

            // Тухайн хичээл дээр дүн нь гарсан курсын жагсаалт
            let newCource = []
            if(data?.levels?.length > 0) {
                data?.levels?.map((level) => {
                    let row = {
                        id: level,
                        name: level
                    }
                    newCource.push(row)
                })
            }
            setStudent_levelOptions(newCource)
        }
    }

    useEffect(() => {
        if(rowData?.id) {
            getGroupDatas(rowData?.id)
        }
    }, [rowData?.id])

	async function onSubmit(cdata) {
        cdata['old_lesson'] = rowData?.id
        cdata['cources'] = selectedKurs
        cdata['group'] = selectGroups

        cdata = convertDefaultValue(cdata)

        const { success, error } = await fetchData(lessonStandartApi.updateGroupScore(rowData?.id, cdata))
        if(success) {
            resetField('lesson')
            setSelectGroups([])
            setSelectedKurs([])
            if(rowData?.id) {
                getGroupDatas(rowData?.id)
            }
        } else {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in error) {
                setError(error[key].field, { type: 'custom', message:  error[key].msg});
            }
        }
	}

    //  Хичээлийн жагсаалт select ашигласан
    async function getSelectLessonDatas(state){
        const { success, data } = await lessonFetchData(lessonStandartApi.getSelectLessons(state, school_id))
        if(success){
            let lessonId = rowData?.id

            let resultDatas = data?.filter((item) => item?.id !== lessonId)
            setScrollLessonDatas((prev) => [...prev, ...resultDatas])
        }
    }

    useEffect(() => {
        getSelectLessonDatas(2)
    }, [school_id])

    // Хичээлийн жагсаалт
    async function getLessonOption(searchValue) {
        const { success, data } = await lessonFetchData(lessonStandartApi.getSearchList(searchValue, school_id))
        if(success) {
            let lessonId = rowData?.id

            let resultDatas = data?.filter((item) => item?.id !== lessonId)
            setLessonOption(resultDatas)
        }
    }

    // Хичээл дээр хайлт бичихэд
    function handleLessonSelect(value){
        getLessonOption(value)
    }

	return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className="modal-dialog-centered modal-lg"
                contentClassName="pt-0"
                onClosed={handleModal}
                backdrop='static'
            >
                <ModalHeader className="bg-transparent" toggle={handleModal}>
                    <h5>{t(`Анги бүлгийн дүн засах`)}</h5>
                </ModalHeader>
                <ModalBody className="px-sm-3 pt-50 pb-3">
                    {isLoading && Loader}
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col lg={12}>
                            <Label className="form-label" for="course">
                                {t('Курс')}
                            </Label>
                            <Select
                                name="course"
                                id="course"
                                classNamePrefix='select'
                                isClearable
                                className={classnames('react-select')}
                                isLoading={isLessonLoading}
                                placeholder={t(`-- Сонгоно уу --`)}
                                options={student_levelOptions || []}
                                value={selectedKurs ? student_levelOptions?.filter((item) => selectedKurs.includes(item?.id)) : ''}
                                noOptionsMessage={() => t('Хоосон байна.')}
                                onChange={(val) => {
                                    let newCourse = val?.map((item) => item?.id) || []
                                    setSelectedKurs(newCourse)

                                    if(selectGroups?.length > 0) {
                                        // Зөвхөн сонгосон курсын ангийг авна
                                        let newSelectGroup = group_option?.map((item) => {
                                            if(newCourse?.includes(item?.level) && selectGroups?.includes(item?.id)) {
                                                return item?.id
                                            }
                                        }) || []

                                        setSelectGroups(newSelectGroup)
                                    } else {
                                        setSelectGroups([])
                                    }

                                }}
                                isMulti
                                styles={ReactSelectStyles}
                                getOptionValue={(option) => option?.id}
                                getOptionLabel={(option) => option?.name}
                            />
                        </Col>
                        <Col lg={12}>
                            <Label className="form-label" for="group">
                                {t('Анги')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue={''}
                                name="group"
                                render={({ field: { value, onChange} }) => {
                                    let newGroupOptions = selectedKurs?.length > 0 ? group_option?.filter((item) => selectedKurs?.includes(item?.level)) : group_option
                                    return (
                                        <Select
                                            name="group"
                                            id="group"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.group })}
                                            isLoading={isLessonLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={newGroupOptions || []}
                                            value={selectGroups ? newGroupOptions?.filter((item) => selectGroups.includes(item?.id)) : []}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val?.map((item) => item?.id) || [])
                                                setSelectGroups(val?.map((item) => item?.id) || [])
                                            }}
                                            isMulti
                                            isSearchable={true}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => `${option.name} (${option.active_student_count})`}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.group && <FormFeedback className='d-block'>{t(errors.group.message)}</FormFeedback>}
                        </Col>
                        <Col lg={12}>
                            <Label className="form-label" for="lesson">
                                {t('Өөрчлөх хичээл')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="lesson"
                                render={({ field: { value, onChange } }) => {
                                    return (
                                        <Select
                                            name="lesson"
                                            id="lesson"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', {'is-invalid': errors.lesson})}
                                            placeholder={`Хайх`}
                                            isLoading={isLessonLoading}
                                            loadingMessage={() => "Түр хүлээнэ үү..."}
                                            options={
                                                lesson_search_value.length === 0
                                                    ? scrollLessonDatas || []
                                                    : lesson_option || []
                                            }
                                            value={
                                                lesson_search_value.length === 0
                                                    ? value ? scrollLessonDatas.find((c) => c.id === value) : ''
                                                    : value ? lesson_option.find((c) => c.id === value) : ''
                                            }
                                            noOptionsMessage={() =>
                                                lesson_search_value.length > 1
                                                    ? t('Хоосон байна')
                                                    : null
                                            }
                                            onMenuScrollToBottom={() => {
                                                if(lesson_search_value.length === 0){
                                                    setBottomLessonCheck(bottomLessoncheck + 1)
                                                    getSelectLessonDatas(bottomLessoncheck)
                                                }
                                            }}
                                            onChange={(val) => {
                                                onChange(val?.id || '')

                                            }}
                                            onInputChange={(e) => {
                                                setLessonSearchValue(e);
                                                if(e.length > 1 && e !== lesson_search_value){
                                                    handleLessonSelect(e);
                                                } else if (e.length === 0){
                                                    setLessonOption([]);
                                                }
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.full_name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.lesson && <FormFeedback className='d-block'>{t(errors.lesson.message)}</FormFeedback>}
                        </Col>
                        <Col md={12} className="text-center">
                            <Button className="me-2" color="primary" type="submit" size='md' disabled={!group_option?.length}>
                                {t('Засах')}
                            </Button>
                            <Button color="secondary" type="reset" outline  onClick={handleModal} size='md'>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
	);
};
export default GroupEditScore;

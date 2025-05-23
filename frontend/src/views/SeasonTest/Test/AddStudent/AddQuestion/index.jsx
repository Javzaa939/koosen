import { useState, Fragment, useEffect } from 'react';
import { useForm, Controller } from "react-hook-form";
import { convertDefaultValue, ReactSelectStyles } from "@utils";
import { t } from 'i18next';

import {
    Modal,
    ModalHeader,
    ModalBody,
    Row,
    Form,
    Col,
    Label,
    Input,
    Button,
} from "reactstrap";

import Select from 'react-select';
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

const AddQuestion = ({ open, handleModal, lesson, refreshDatas, challenge, refreshQuestionData, status}) => {

    const { control, handleSubmit, setError, watch, formState: { errors } } = useForm()
    const { fetchData } = useLoader({ isFullScreen: true });

    const [select_data, setSelectDatas] = useState([])
    const [yearOption, setYearOption] = useState([])
    const [seasonOption, setSeasonOption] = useState([])

    const [lessonYear, setLessonYear] = useState('')
    const [lessonSeason, setSeason] = useState('')

    const challengeAPI = useApi().challenge.question
    const challengesAPI = useApi().challenge
    const seasonApi = useApi().settings.season

    async function getSelectDatas() {
        const { success, data } = await fetchData(challengeAPI.getLevel(lesson, lessonYear, lessonSeason))
        if (success) {
            setSelectDatas(data)
        }
    }

    async function getYears() {
        const { success, data } = await fetchData(challengeAPI.getYear(lesson))
        if (success) {
            setYearOption(data)
        }
    }

    async function getSeason() {
        const {success, data } = await fetchData(seasonApi.get())
        if (success) {
            setSeasonOption(data)
        }
    }

    useEffect(() => {
        getYears()
        getSeason()
    }, [])

    useEffect(() => {
        getSelectDatas()
    }, [lessonYear, lessonSeason])

    const numberOfQuestions = watch("number_questions");
    const percentageOfQuestions = watch("number_questions_percentage");

    async function onSubmit(cdata) {
        cdata['challenge'] = challenge;
        cdata = convertDefaultValue(cdata)
        const { success, error } = await fetchData(challengesAPI.postLevelCount(cdata))
        if (success) {
            handleModal()
            refreshDatas()
            refreshQuestionData()
        }
        else {
            for (let key in error) {
                setError(error[key].field, { type: 'custom', message: error[key].msg });
            }
        }
    }

    return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className="modal-dialog-centered modal-sm"
                contentClassName="pt-0"
                fade={true}
            >
                <ModalHeader toggle={handleModal}></ModalHeader>
                <ModalHeader className='bg-transparent pb-0' cssModule={{ 'modal-title': 'w-100 text-center' }}>
                    <h4>{t('Асуулт нэмэх')}</h4>
                </ModalHeader>
                <ModalBody className="flex-grow-1 mb-3">
                    <Row tag={Form} onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className="form-label" for="lesson_year">
                                {t('Хичээлийн жил')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="lesson_year"
                                render={({ field: { value, onChange } }) => (
                                    <Select
                                        id="lesson_year"
                                        name="lesson_year"
                                        isClearable
                                        classNamePrefix='select'
                                        className='react-select'
                                        placeholder={`-- Сонгоно уу --`}
                                        options={yearOption || []}
                                        value={yearOption?.find((c) => c.id === lessonYear)}
                                        noOptionsMessage={() => 'Хоосон байна'}
                                        onChange={(val) =>
                                            (
                                                setLessonYear(val?.id || ''),
                                                onChange(val?.id)
                                            )
                                        }
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )}
                            />
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="lesson_season">
                                {t('Хичээлийн улирал')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="lesson_season"
                                render={({ field: { value, onChange } }) => (
                                    <Select
                                        id="lesson_season"
                                        name="lesson_season"
                                        isClearable
                                        classNamePrefix='select'
                                        className='react-select'
                                        placeholder={`-- Сонгоно уу --`}
                                        options={seasonOption || []}
                                        value={seasonOption?.find((c) => c.id === lessonYear)}
                                        noOptionsMessage={() => 'Хоосон байна'}
                                        onChange={(val) => (
                                            setSeason(val?.id || ''),
                                            onChange(val?.id)
                                        )}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.season_name}
                                    />
                                )}
                            />
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="subject">
                                {t('Түвшин сонгох')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="subject"
                                render={({ field: { value, onChange } }) => (
                                    <Select
                                        id="subject"
                                        name="subject"
                                        isClearable
                                        classNamePrefix='select'
                                        className='react-select'
                                        placeholder={`-- Сонгоно уу --`}
                                        options={select_data || []}
                                        value={select_data.find((c) => c.level === value)}
                                        noOptionsMessage={() => 'Хоосон байна'}
                                        onChange={(val) => onChange(val?.level || '')}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.level}
                                        getOptionLabel={(option) => option.type_name + ' (' + (option?.question_count || 0) + ')'}
                                    />
                                )}
                            />
                        </Col>
                        <Col md={6} className='mt-1'>
                            <Label className="form-label" for="number_questions">
                                {t('Асуултын тоо')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                name="number_questions"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        bsSize="sm"
                                        type="number"
                                        placeholder="Тоо ширхэгээр"
                                        disabled={!!percentageOfQuestions}
                                    />
                                )}
                            />
                        </Col>
                        <Col md={6} className='mt-1'>
                            <Label className="form-label" for="number_questions_percentage">
                                {t('Асуултын тоо хувиар')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                name="number_questions_percentage"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        bsSize="sm"
                                        type="number"
                                        placeholder="Хувиар %"
                                        disabled={!!numberOfQuestions}
                                    />
                                )}
                            />
                        </Col>
                        <Col md={12} className="text-center mt-3">
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
export default AddQuestion;

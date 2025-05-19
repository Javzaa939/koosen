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
import { CHALLENGE_TYPE_ADMISSION } from '../../helpers';

const AddQuestion = ({ open, handleModal, lesson, refreshDatas, challenge, refreshQuestionData, status}) => {

    const { control, handleSubmit, setError, watch, formState: { errors } } = useForm()
    const { fetchData } = useLoader({ isFullScreen: true });

    const [select_data, setSelectDatas] = useState([])
    const levels_data = [
        { id: 1, name: 'Хөнгөн' },
        { id: 2, name: 'Дунд' },
        { id: 3, name: 'Хүнд' }
    ];

    const challengeAPI = useApi().challenge.question
    const challengesAPI = useApi().challenge

    async function getSelectDatas() {
        const { success, data } = await fetchData(challengeAPI.getTitle('', false, 0, CHALLENGE_TYPE_ADMISSION))
        if (success) {
            setSelectDatas(data)
        }
    }

    useEffect(() => {
        getSelectDatas()
    }, [])

    const numberOfQuestions = watch("number_questions");
    const percentageOfQuestions = watch("number_questions_percentage");

    async function onSubmit(cdata) {
        cdata['challenge'] = challenge;
        cdata = convertDefaultValue(cdata)
        const { success, error } = await fetchData(challengesAPI.postSedevCount(cdata))
        if (success) {
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
                            <Label className="form-label" for="subject">
                                {t('Сэдэв сонгох')}
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
                                        value={select_data.find((c) => c.id === value)}
                                        noOptionsMessage={() => 'Хоосон байна'}
                                        onChange={(val) => onChange(val?.id || '')}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )}
                            />
                        </Col>
                        <Col md={12}>
                            <Label className="form-label mt-2" for="level_of_question">
                                {t('Шалгалтын асуултын түвшин')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="level_of_question"
                                render={({ field: { value, onChange } }) => (
                                    <Select
                                        id="level_of_question"
                                        name="level_of_question"
                                        isClearable
                                        classNamePrefix='select'
                                        className='react-select'
                                        placeholder={`-- Сонгоно уу --`}
                                        options={levels_data || []}
                                        value={levels_data.find((c) => c.id === value)}
                                        noOptionsMessage={() => 'Хоосон байна'}
                                        onChange={(val) => onChange(val?.id || '')}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
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

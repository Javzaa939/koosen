import React, { Fragment, useState, useEffect, useContext } from 'react';
import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from "react-hook-form";
import { Col, Modal, Label, Button, ModalBody, ModalHeader, Spinner, FormGroup, Input, Row, FormFeedback, Alert } from "reactstrap";
import Select from "react-select";
import classnames from "classnames";
import AuthContext from '@src/utility/context/AuthContext';
import { ReactSelectStyles } from "@utils";

const Addmodal = ({ open, handleModal, refreshDatas, timetableId, teacherOption, teacherId, setTeacherId, weekId, teacherIds, setTeacherIds }) => {
    const { user } = useContext(AuthContext)
    const { t } = useTranslation();
    const [radioValue, setRadioValue] = useState('all');
    const [selectedGroups, setGroups] = useState([]);
    const [groupTeacherMap, setGroupTeacherMap] = useState({});

    const timetableApi = useApi().timetable;
    const { control, handleSubmit, setError, formState: { errors }, reset, setValue } = useForm({
        defaultValues: {
            teacher_group: "all",
            type: "single_timetable",
        }
    });

    const { Loader, isLoading, fetchData } = useLoader({});
    const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    async function getGroups() {
        const { success, data } = await fetchData(timetableApi.getGroupsById(timetableId))
        if (success) {
            setGroups(data)
        }
    }

    useEffect(() => {
        getGroups()
    }, [])

    const onSubmit = async (cdata) => {
        if (radioValue === 'one') {
            cdata['group_teachers'] = groupTeacherMap
        }
        cdata['week_number'] = weekId
        const hasErrors = checkDefaultValue(cdata);
        if (hasErrors) {
            return;
        }
        else {
            const { success, error } = await postFetch(timetableApi.postTeacher(timetableId, cdata));
            if (success) {
                reset()
                refreshDatas();
                handleModal();
                setTeacherId('')
            }
            else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in error) {
                    setError(error[key].field, { type: 'custom', message: error[key].msg });
                }
            }
        }

    };

    const handleRadioChange = (value) => {
        setRadioValue(value);
    };

    const handleTeacherChange = (groupId, teacherId) => {
        setGroupTeacherMap((prev) => ({
            ...prev,
            [groupId]: teacherId,
        }));
    };

    function checkDefaultValue(cdata) {
        let hasErrors = false;
        if (!teacherIds?.length) {
            if (!cdata.teacher_group) {
                setError('teacher_group', { type: 'custom', message: 'Заавал сонгон уу' })
                hasErrors = true;
            }
            if (radioValue === 'all') {
                if (!cdata.support_teacher?.length) {
                    setError('support_teacher', { type: 'custom', message: 'Заавал сонгон уу' })
                    hasErrors = true;
                }
            }
            if (!cdata.type) {
                setError('type', { type: 'custom', message: 'Заавал сонгон уу' })
                hasErrors = true;
            }
        }
        return hasErrors
    }

    useEffect(() => {
        setValue("support_teacher", teacherIds)
    }, [teacherIds])

    return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className="modal-dialog-centered modal-sm"
                contentClassName="pt-0"
            >
                <ModalHeader
                    className="mb-1"
                    toggle={handleModal}
                    tag="div"
                >
                    <h5 className="modal-title">{t('Багш сонгох')}</h5>
                </ModalHeader>
                <ModalBody className="">
                    {(isLoading || postLoading) && Loader}
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {errors.teacher_group && (
                            <FormFeedback className="d-block">
                                {t(errors.teacher_group.message)}
                            </FormFeedback>
                        )}
                        <Col md={12} className="mt-1">
                            <FormGroup className="d-flex gap-3">
                                <Label check>
                                    <Controller
                                        control={control}
                                        name="teacher_group"
                                        render={({ field: { value, onChange } }) => (
                                            <Input
                                                type="radio"
                                                value="all"
                                                checked={value === "all"}
                                                onChange={(e) => {
                                                    onChange(e.target.value);
                                                    handleRadioChange(e.target.value);
                                                }}
                                            />
                                        )}
                                    />
                                    {' '}
                                    {t('Бүх анги дээр')}
                                </Label>
                                <Label check>
                                    <Controller
                                        control={control}
                                        name="teacher_group"
                                        render={({ field: { value, onChange } }) => (
                                            <Input
                                                type="radio"
                                                value="one"
                                                checked={value === "one"}
                                                onChange={(e) => {
                                                    onChange(e.target.value);
                                                    handleRadioChange(e.target.value);
                                                }}
                                            />
                                        )}
                                    />
                                    {' '}
                                    {t('Нэг нэг ангиар')}
                                </Label>
                            </FormGroup>
                        </Col>
                        {
                            radioValue === "all" ? (
                                <>
                                    <Alert color='warning' className='p-25'>
                                        Заах багшид нэгээс олон багш сонгосон бол тухайн багш нарын цагийн ачаалал хуваагдаж орохыг анхаарна уу!!!
                                    </Alert>
                                    <Col md={12} className="mb-3">
                                        <Label className="form-label" for="support_teacher">
                                            {t('Заах багш')}
                                        </Label>
                                        <Controller
                                            control={control}
                                            name="support_teacher"
                                            defaultValue={teacherIds || ""}
                                            render={({ field: { value, onChange } }) => {
                                                return(
                                                    <Select
                                                        id="support_teacher"
                                                        classNamePrefix="select"
                                                        isClearable
                                                        isMulti
                                                        className={classnames('react-select', { 'is-invalid': errors.teacher })}
                                                        isLoading={isLoading}
                                                        placeholder={t('-- Сонгоно уу --')}
                                                        options={teacherOption || []}
                                                        value={value ? teacherOption.filter((c) => value?.includes(c.id)) : []}
                                                        noOptionsMessage={() => t('Хоосон байна.')}
                                                        onChange={(val) => {
                                                            let values = val?.map((item) => item?.id) || []
                                                            onChange(values)
                                                        }}
                                                        styles={ReactSelectStyles}
                                                        getOptionValue={(option) => option.id}
                                                        getOptionLabel={(option) => `${option?.last_name} ${option?.first_name}`}
                                                    />
                                                )}
                                            }
                                        />
                                        {errors.support_teacher && (
                                            <FormFeedback className="d-block">
                                                {t(errors.support_teacher.message)}
                                            </FormFeedback>
                                        )}
                                    </Col>
                                </>
                            ) : (
                                <>
                                    {selectedGroups && selectedGroups.length > 0 && (user?.permissions?.includes('lms-timetable-register-teacher-update') || user?.is_superuser) && (
                                        <>
                                            {selectedGroups.map((group, index) => (
                                                <Row key={group.id} className='mb-3'>
                                                    <Col md={6} sm={12}>
                                                        <Label className="form-label" for={`class-${group.id}`}>
                                                            {t(`Анги-${index + 1}`)}
                                                        </Label>
                                                        <Input
                                                            id={`class-${group.id}`}
                                                            className="mb-50 me-1"
                                                            type="text"
                                                            bsSize="sm"
                                                            disabled
                                                            value={group.name}
                                                        />
                                                    </Col>
                                                    <Col md={6} sm={12}>
                                                        <Label className="form-label" for={`${group.id}-teacher`}>
                                                            {t("Багш")}
                                                        </Label>
                                                        <Controller
                                                            control={control}
                                                            defaultValue={
                                                                teacherId || ""
                                                            }
                                                            name={`${group.id}-teacher`}
                                                            render={({ field: { value, onChange } }) => (
                                                                <Select
                                                                    name={`${group.id}-teacher`}
                                                                    id={`${group.id}-teacher`}
                                                                    classNamePrefix="select"
                                                                    isClearable
                                                                    className={classnames("react-select", {
                                                                        "is-invalid": errors.teacher,
                                                                    })}
                                                                    isLoading={isLoading}
                                                                    placeholder={t(`-- Сонгоно уу --`)}
                                                                    options={teacherOption || []}
                                                                    value={teacherOption.find((c) => c.id === value)}
                                                                    noOptionsMessage={() => t("Хоосон байна.")}
                                                                    onChange={(val) => {
                                                                        handleTeacherChange(group.id, val?.id || "")
                                                                        onChange(val?.id)
                                                                    }
                                                                    }
                                                                    styles={ReactSelectStyles}
                                                                    getOptionValue={(option) => option.id}
                                                                    getOptionLabel={(option) => `${option?.last_name} ${option?.first_name}`}
                                                                />
                                                            )}
                                                        />
                                                        {errors.teacher && (
                                                            <FormFeedback className="d-block">
                                                                {t(errors.teacher.message)}
                                                            </FormFeedback>
                                                        )}
                                                    </Col>
                                                </Row>
                                            ))}
                                        </>
                                    )}
                                </>
                            )
                        }
                        {errors.type && (
                            <FormFeedback className="d-block">
                                {t(errors.type.message)}
                            </FormFeedback>
                        )}
                        <Col md={12} className="d-flex gap-3 ">
                            <FormGroup>
                                <Label check>
                                    <Controller
                                        control={control}
                                        name="type"
                                        defaultValue=""
                                        render={({ field: { value, onChange } }) => (
                                            <Input
                                                type="radio"
                                                value="all_timetable"
                                                checked={value === "all_timetable"}
                                                onChange={(e) => {
                                                    onChange(e.target.value)
                                                }}
                                            />
                                        )}
                                    />
                                    {' '}
                                    {t('Бүх хуваарь дээр')}
                                </Label>
                            </FormGroup>
                            <FormGroup>
                                <Label check>
                                    <Controller
                                        control={control}
                                        name="type"
                                        render={({ field: { value, onChange } }) => (
                                            <Input
                                                type="radio"
                                                value="single_timetable"
                                                checked={value === "single_timetable"}
                                                onChange={(e) => {
                                                    onChange(e.target.value)
                                                }}
                                            />
                                        )}
                                    />
                                    {' '}
                                    {t('Зөвхөн энэ хуваарь дээр')}
                                </Label>
                            </FormGroup>
                        </Col>
                        <Button
                            className="me-2"
                            color="primary"
                            type="submit"
                            disabled={postLoading}
                        >
                            {postLoading && <Spinner size="sm" className="me-1" />}
                            {t('Хадгалах')}
                        </Button>
                        <Button
                            color="secondary"
                            type="button"
                            outline
                            onClick={handleModal}
                        >
                            {t('Буцах')}
                        </Button>
                    </form>
                </ModalBody>
            </Modal>
        </Fragment>
    );
};

export default Addmodal;

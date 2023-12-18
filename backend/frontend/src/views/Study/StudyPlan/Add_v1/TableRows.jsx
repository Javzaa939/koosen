import React, { useContext, useEffect, useState } from 'react';

import { Button, FormFeedback, Input } from 'reactstrap';

import { useTranslation } from 'react-i18next';

import { useForm, Controller } from "react-hook-form";

import Select from 'react-select'

import useApi from "@hooks/useApi";
import useModal from '@hooks/useModal'
import useLoader from "@hooks/useLoader";
import SchoolContext from "@context/SchoolContext"
import AuthContext from "@context/AuthContext"

import { ReactSelectStyles, get_learningplan_season } from "@utils"

import classnames from "classnames";

function TableRows({ rows, tableRowRemove, onValUpdate, profession }) {
    // ** Hook
    const { control, setValue } = useForm({});

    const { showWarning } = useModal()

    const { t } = useTranslation()
    const { user } = useContext(AuthContext)

    const [standart_option, setStandartOption] = useState([])
    const [standart_bagts_option, setStandartBagtsOption] = useState([])
    const [season_option, setSeasonOption] = useState(get_learningplan_season())

    // Loader
	const { fetchData } = useLoader({});

    // Api
    const lessonStandartApi = useApi().study.lessonStandart

    // Хичээлийн жагсаалт
    async function getLessonStandart() {
        const { success, data } = await fetchData(lessonStandartApi.getListAll())
        if(success) {
            setStandartOption(data)
        }
    }

    // Хичээлийн жагсаалт
    async function getLessonBagtsStandart() {
        if (profession) {
            const { success, data } = await fetchData(lessonStandartApi.getOneProfessionList(profession))
            if(success) {
                setStandartBagtsOption(data)
            }
        }
    }

    useEffect(() => {
        getLessonStandart()
    },[])

    useEffect(() => {
        getLessonBagtsStandart()
    },[profession])

    function seasonValue(seasons) {
        var cseason_ids = []
        if(seasons && seasons.length > 0) {
            seasons.map((season) => {
                var selected = season_option.find((e) => e.id == season)
                if(selected && !cseason_ids.includes(selected)) {
                    cseason_ids.push(selected)
                }
            })
        }
        return cseason_ids
    }

    return rows.map((rowsData, index) => {
        const { lesson, previous_lesson, group_lesson, season, is_check_score, errors } = rowsData;

        return (
            <tr key={index}>
                <td className='text-center'>{index + 1}</td>
                <td className="col-lg-3 col-md-6">
                    <Controller
                        control={control}
                        defaultValue=''
                        name="lesson"
                        render={({ field: { value, onChange} }) => {
                            return (
                                <Select
                                    name="lesson"
                                    id="lesson"
                                    classNamePrefix='select'
                                    isClearable
                                    className={classnames('react-select', { 'is-invalid': !lesson }) }
                                    placeholder={t('-- Сонгоно уу --')}
                                    options={standart_option || []}
                                    value={lesson && standart_option.find((c) => c.id === lesson)}
                                    noOptionsMessage={() => t('Хоосон байна.')}
                                    onChange={(val) => {
                                        onChange(val?.id || '')
                                        onValUpdate('lesson', index, val?.id || '')
                                    }}
                                    menuPlacement="auto"
                                    // menuPosition='absolute'
                                    styles={ReactSelectStyles}
                                    getOptionValue={(option) => option.id}
                                    getOptionLabel={(option) => option.full_name}
                                />
                            )
                        }}
                    ></Controller>
                    {!lesson && <FormFeedback className='d-block'>{t("Хоосон байна")}</FormFeedback>}
                </td>
                <td className="col-lg-2 col-md-6">
                    <Controller
                        control={control}
                        defaultValue=''
                        name="previous_lesson"
                        render={({ field: { value, onChange} }) => {
                            return (
                                <Select
                                    name="previous_lesson"
                                    id="previous_lesson"
                                    classNamePrefix='select'
                                    isClearable
                                    className={classnames('react-select')}
                                    placeholder={t('-- Сонгоно уу --')}
                                    options={standart_option || []}
                                    value={previous_lesson && standart_option.find((c) => c.id === previous_lesson)}
                                    noOptionsMessage={() => t('Хоосон байна.')}
                                    onChange={(val) => {
                                        onChange(val?.id || '')
                                        onValUpdate('previous_lesson', index, val?.id || '')
                                    }}
                                    menuPlacement="auto"
                                    menuPosition='absolute'
                                    styles={ReactSelectStyles}
                                    getOptionValue={(option) => option.id}
                                    getOptionLabel={(option) => option.full_name}
                                />
                            )
                        }}
                    ></Controller>
                </td>
                <td className="col-lg-3 col-sm-6 select-container">
                    <Controller
                        control={control}
                        defaultValue=''
                        name="group_lesson"
                        render={({ field: { value, onChange} }) => {
                            return (
                                <Select
                                    name="group_lesson"
                                    id="group_lesson"
                                    classNamePrefix='select'
                                    isClearable
                                    className={classnames('react-select')}
                                    placeholder={t('-- Сонгоно уу --')}
                                    options={standart_bagts_option && standart_bagts_option || []}
                                    value={group_lesson && standart_bagts_option.find((c) => c.id == group_lesson)}
                                    noOptionsMessage={() => t('Хоосон байна.')}
                                    onChange={(val) => {
                                        onChange(val?.id || '')
                                        onValUpdate('group_lesson', index, val?.id || '')
                                    }}
                                    menuPlacement="auto"
                                    menuPosition='absolute'
                                    styles={ReactSelectStyles}
                                    getOptionValue={(option) => option.id}
                                    getOptionLabel={(option) => option.full_name}
                                />
                            )
                        }}
                    ></Controller>
                </td>
                <td className={"col-lg-2 col-md-6"}>
                    <Controller
                        control={control}
                        defaultValue=''
                        name="season"
                        render={({ field: { value, onChange} }) => {
                            return (
                                <Select
                                    name="season"
                                    id="season"
                                    classNamePrefix='select'
                                    isClearable
                                    className={classnames('react-select', { 'is-invalid': errors?.season })}
                                    placeholder={t('-- Сонгоно уу --')}
                                    options={season_option || []}
                                    value={season && seasonValue(season)}
                                    noOptionsMessage={() => t('Хоосон байна.')}
                                    onChange={(val) => {
                                        onChange(val?.id || '')
                                        onValUpdate('season', index, val?.id || '', val)
                                    }}
                                    isMulti
                                    menuPlacement="auto"
                                    styles={ReactSelectStyles}
                                    getOptionValue={(option) => option.id}
                                    getOptionLabel={(option) => option.name}
                                />
                            )
                        }}
                    ></Controller>
                </td>
                <td className={`text-center col-lg-3 col-md-6`}>
                    <Controller
                        defaultValue={false}
                        control={control}
                        id='is_check_score'
                        name='is_check_score'
                        render={({ field }) => {
                            return (
                                <Input
                                    {...field}
                                    checked={is_check_score}
                                    onChange={(e) => onValUpdate('is_check_score', index, e.target.checked)}
                                    className='me-50'
                                    type='checkbox'
                                    name='is_check_score'
                                    id='is_check_score'
                                />
                            )
                        }}
                    />
                </td>
                {
                    user && Object.keys(user).length > 0 && user.permissions.includes('lms-study-learningplan-delete') &&
                    <td className='text-center w-10'>
                        <Button size='sm' color="danger" type="reset"
                            onClick={() => showWarning({
                                header: {
                                    title: `${t('Устгах')}`,
                                },
                                question: `Та устгахдаа итгэлтэй байна уу?`,
                                onClick: () => tableRowRemove(index, rowsData?.id),
                                btnText: 'Устгах',
                            })}
                        >
                            {t('Устгах')}
                        </Button>
                    </td>
                }
            </tr>
        );
    });
}
export default TableRows

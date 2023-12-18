import React, { useContext, useEffect, useState } from 'react';

import { Button, FormFeedback, Input, Badge } from 'reactstrap';
import { CornerDownRight, X} from 'react-feather'

import { useTranslation } from 'react-i18next';

import { useForm, Controller } from "react-hook-form";

import Select from 'react-select'

import useModal from '@hooks/useModal'
import AuthContext from "@context/AuthContext"

import { ReactSelectStyles, get_week } from "@utils"

import classnames from "classnames";

function TableRows({ rows, tableRowRemove, onValUpdate }) {
    // ** Hook
    const { control } = useForm({});

    const { showWarning } = useModal()

    const { t } = useTranslation()
    const { user } = useContext(AuthContext)

    const [week_option, setWeekOption] = useState(get_week())



    return rows.map((rowsData, index) => {
        const { id, week, title, content, lesson_type, errors } = rowsData;
        return (
            <tr key={index}>
                <td>{index + 1}</td>
                <td>
                    <Controller
                        control={control}
                        defaultValue=''
                        name="week"
                        render={({ field: { value, onChange} }) => {
                            return (
                                <Select
                                    name="week"
                                    id="week"
                                    classNamePrefix='select'
                                    isClearable
                                    className={classnames('react-select', { 'is-invalid': errors?.week })}
                                    placeholder={t('-- Сонгоно уу --')}
                                    options={week_option || []}
                                    value={week && week_option.find((c) => c.id === week)}
                                    noOptionsMessage={() => t('Хоосон байна.')}
                                    onChange={(val) => {
                                        onChange(val?.id || '')
                                        onValUpdate(index,'week',val?.id || '')
                                    }}
                                    styles={ReactSelectStyles}
                                    getOptionValue={(option) => option.id}
                                    getOptionLabel={(option) => option.name}
                                />
                            )
                        }}
                        ></Controller>
                </td>
                <td>
                    <Controller
                        defaultValue=''
                        control={control}
                        id="title"
                        name="title"
                        render={({ field }) => (
                            <Input
                                id ="title"
                                bsSize="sm"
                                placeholder={t('Гарчиг')}
                                {...field}
                                type="text"
                                value={title}
                                onChange={(e)=> onValUpdate(index,'title',e.target.value)}
                                invalid={errors?.title && true}
                            />
                        )}
                    ></Controller>
                </td>
                <td>
                    <Controller
                        defaultValue=''
                        control={control}
                        id="content"
                        name="content"
                        render={({ field }) => (
                            <Input
                                id ="content"
                                bsSize="sm"
                                placeholder={t('Гарчиг')}
                                {...field}
                                type="textarea"
                                value={content}
                                onChange={(e)=> onValUpdate(index,'content',e.target.value)}
                                invalid={errors?.content && true}
                            />
                        )}
                    ></Controller>
                </td>
                {
                    user && Object.keys(user).length > 0 && user.permissions.includes('lms-study-learningplan-delete') &&
                    <td className='text-center'>
                        {/* <a role="button"
                            onClick={onValUpdate(index, week,title,content)}
                        >           <Badge color="light-success" pill><CornerDownLeft width={"15px"} /></Badge>
                        </a> */}
                        <a role="button"
                            onClick={() => showWarning({
                                header: {
                                    title: `${t('Устгах')}`,
                                },
                                question: `Та устгахдаа итгэлтэй байна уу?`,
                                onClick: () => tableRowRemove(index, rowsData?.id),
                                btnText: 'Устгах',
                            })}
                        >
                         <Badge color="light-danger" pill> <X width={"15px"} /></Badge>
                        </a>
                    </td>
                }
            </tr>
        );
    });
}
export default TableRows

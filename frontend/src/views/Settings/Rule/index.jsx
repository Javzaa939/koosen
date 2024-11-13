import React, { useState, useEffect } from 'react'
import {
    Card,
    Form,
    Label,
    Input,
    Button,
    CardBody,
    CardHeader,
    CardTitle,
    FormFeedback,
    Col,
} from 'reactstrap'

import { Edit } from 'react-feather'
import { useForm, Controller } from "react-hook-form";

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import * as Yup from 'yup';
import { validate, convertDefaultValue } from '@utils'
import classNames from 'classnames';
import { ReactSelectStyles } from '@src/utility/Utils';
import Select from 'react-select'
import { useTranslation } from 'react-i18next';

const validationSchema = Yup.object().shape({
    rule_title: Yup.string()
        .trim()
        .required('Хоосон байна'),
    rule_file: Yup.string()
        .trim()
        .required('Хоосон байна'),
});

export default function Rule() {

    const [edit, setEdit] = useState(false)

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm(validate(validationSchema));

    const configApi = useApi().hrms.school
    const { fetchData } = useLoader({})
    const { t } = useTranslation()

    async function onSubmit(cdata) {
        const datas = convertDefaultValue(cdata)
        const { success } = await fetchData(configApi.put(datas))
        if (success) setEdit(false)
    }

    const getData = async () => {
        const { success, data } = await fetchData(configApi.get())

        if (success)
            for (let key in data)
                if (data[key] !== null) setValue(key, data[key])
                else setValue(key, '')
    }

    useEffect(() => {
        getData()
    }, [])

    return (
        <Col md={4}>
            <Card>
                <CardHeader>
                    <CardTitle>Дүрэм журмын файлын тохиргоо</CardTitle>
                    <Edit size={20} onClick={() => setEdit(!edit)} />
                </CardHeader>
                <CardBody>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <fieldset disabled={!edit}>
                            <div className="mb-2">
                                <Label className="form-label">
                                    Гарчиг
                                </Label>
                                <Controller
                                    defaultValue=""
                                    control={control}
                                    name="rule_title"
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            id={field.name}
                                            type="text"
                                            placeholder="Гарчиг"
                                            invalid={errors[field.name] && true}
                                        />
                                    )}
                                />
                                {errors.rule_title && <FormFeedback className='d-block'>{errors.rule_title.message}</FormFeedback>}
                            </div>
                            <div className="mb-2">
                                <Label className="form-label">
                                    Дүрэм журмын файл
                                </Label>
                                <Controller
                                    defaultValue=""
                                    control={control}
                                    name="rule_file"
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            id={field.name}
                                            type="file"
                                            placeholder="Дүрэм журмын файл"
                                        />
                                    )}
                                />
                            </div>
                            <div className="mb-2">
                                <Label className="form-label">
                                    Recipients
                                </Label>
                                <Controller
                                    defaultValue=""
                                    control={control}
                                    name="rule_recipient"
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            id={field.name}
                                            classNamePrefix='select'
                                            isClearable
                                            className={classNames('react-select', { 'is-invalid': errors[field.name] })}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={[{ label: 'Оюутан', value: 1 }, { label: 'Багш', value: 2 }]}
                                            styles={ReactSelectStyles}
                                        />
                                    )}
                                />
                            </div>
                            {
                                edit &&
                                <Button className="me-2" color="primary" type="submit">
                                    Хадгалах
                                </Button>
                            }
                        </fieldset>
                    </Form>
                </CardBody>
            </Card>
        </Col>
    )
}

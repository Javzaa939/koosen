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

import { Edit, Download } from 'react-feather'
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
    title: Yup.string()
        .trim()
        .required('Хоосон байна'),
});

export default function Rule() {

    const [edit, setEdit] = useState(false)
    const [stype_options] = useState([{ label: 'Оюутан', value: 1 }, { label: 'Багш', value: 2 }])

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
        watch
    } = useForm(validate(validationSchema));

    const configApi = useApi().settings.rule
    const { fetchData } = useLoader({})
    const { t } = useTranslation()
    const file = watch('file')

    async function onSubmit(cdata) {
        const datas = convertDefaultValue(cdata)
        datas['stype'] = datas['stype'].value
        const formData = new FormData()

        for (const key in datas) {
            if (key === 'file') formData.append(key, cdata[key][0], cdata[key][0].name)
            else formData.append(key, datas[key])
        }

        const { success } = await fetchData(configApi.put(formData))
        if (success) setEdit(false)
    }

    const getData = async () => {
        const { success, data } = await fetchData(configApi.get())

        if (success) {
            const data_obj = data?.results[0]

            for (const key in data_obj)
                if (data_obj[key] !== null) {
                    if (key === 'stype') {
                        setValue(key, stype_options.find(item => item.value === data_obj[key]))
                    } else setValue(key, data_obj[key])
                }
        }
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
                                    name="title"
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
                                {errors.title && <FormFeedback className='d-block'>{errors.title.message}</FormFeedback>}
                            </div>
                            <div className="mb-2">
                                <Label className="form-label">
                                    Дүрэм журмын файл
                                </Label>
                                <Controller
                                    defaultValue=""
                                    control={control}
                                    name="file"
                                    render={({ field }) =>
                                        <>
                                            <Input
                                                name={field.name}
                                                id={field.name}
                                                type="file"
                                                placeholder="Дүрэм журмын файл"
                                                accept="application/pdf, application/vnd.ms-excel"
                                                onChange={(e) => setValue(field.name, e.target.files)}
                                            />
                                            {file && typeof file === 'string' &&
                                                <>
                                                    {file.substring(file.lastIndexOf('/') + 1)}
                                                    <a href={file} className='ms-1'>
                                                        <Download type="button" color='#1a75ff' width={'15px'} />
                                                    </a>
                                                </>
                                            }
                                        </>
                                    }
                                />
                            </div>
                            <div className="mb-2">
                                <Label className="form-label">
                                    Recipients
                                </Label>
                                <Controller
                                    defaultValue=""
                                    control={control}
                                    name="stype"
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            id={field.name}
                                            classNamePrefix='select'
                                            isClearable
                                            className={classNames('react-select', { 'is-invalid': errors[field.name] })}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={stype_options}
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

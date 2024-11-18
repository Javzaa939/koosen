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
    Row,
    Spinner,
} from 'reactstrap'

import { Edit, Download } from 'react-feather'
import { useForm, Controller } from "react-hook-form";

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import * as Yup from 'yup';
import { validate } from '@utils'
import classNames from 'classnames';
import { ReactSelectStyles } from '@src/utility/Utils';
import Select from 'react-select'
import { useTranslation } from 'react-i18next';
import DataTable from 'react-data-table-component';
import moment from 'moment';

export default function Rule() {
    const { t } = useTranslation()

    const validationSchema = Yup.object().shape({
        title: Yup.string()
            .trim()
            .required(t('Хоосон байна')),
        file: Yup.mixed()
            .test(
                'file-required',
                t('Хоосон байна'),
                (value) => (value instanceof FileList && value.length > 0) || (typeof value === 'string' && value.trim() !== '')
            ),
        stype: Yup.object({
            value: Yup.number()
                .transform(value => (isNaN(value) ? 0 : value))
                .required(t('Хоосон байна'))
        })
            .nullable()
            .required(t('Хоосон байна'))
    });

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
        watch
    } = useForm(validate(validationSchema));

    const file = watch('file')
    const stype = watch('stype')

    // states
    const [edit, setEdit] = useState(false)
    const [stype_options] = useState([{ label: t('Оюутан'), value: 1 }, { label: t('Багш'), value: 2 }])
    const [data, setData] = useState([])

    const configApi = useApi().settings.rule
    const { isLoading, fetchData } = useLoader({})

    async function onSubmit(cdata) {
        const formData = new FormData()

        for (const key in cdata) {
            if (key === 'file' && cdata[key] instanceof FileList) formData.append(key, cdata[key][0], cdata[key][0].name)
            else if (key === 'stype') formData.append(key, cdata[key].value)
            else formData.append(key, cdata[key])
        }

        const { success } = await fetchData(configApi.put(formData))
        if (success) {
            setEdit(false)
            getData()
        }
    }

    function fillForm(data_obj, isSwitch=false) {
        for (const key in data_obj)
            if (data_obj[key] !== null) {
                if (key === 'stype') {
                    if (!isSwitch) setValue(key, stype_options.find(item => item.value === data_obj[key]))
                } else setValue(key, data_obj[key])
            }
    }

    const getData = async () => {
        const { success, data } = await fetchData(configApi.get())

        if (success) {
            fillForm(data?.results[0])
            setData(data?.results)
        }
    }

    useEffect(() => {
        getData()
    }, [])

    useEffect(() => {
        if (data) fillForm(data?.find(item => item.stype === stype.value), true)
    }, [stype])

    return (
        <Row>
            <Col md="4">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('Дүрэм журмын файлын тохиргоо')}</CardTitle>
                        <Edit size={20} onClick={() => setEdit(!edit)} />
                    </CardHeader>
                    <CardBody>
                        <Form onSubmit={handleSubmit(onSubmit)}>
                            <fieldset disabled={!edit}>
                                <div className="mb-2">
                                    <Label className="form-label">
                                        {t('Гарчиг')}
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
                                                placeholder={t("Гарчиг")}
                                                invalid={errors[field.name] && true}
                                            />
                                        )}
                                    />
                                    {errors.title && <FormFeedback className='d-block'>{errors.title.message}</FormFeedback>}
                                </div>
                                <div className="mb-2">
                                    <Label className="form-label">
                                        {t('Дүрэм журмын файл')}
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
                                                    placeholder={t("Дүрэм журмын файл")}
                                                    onChange={(e) => field.onChange(e.target.files)
                                                        // setValue(field.name, e.target.files)
                                                    }
                                                />
                                                {file && typeof file === 'string' &&
                                                    <>
                                                        <a href={file} className='me-1'>
                                                            <Download type="button" color='#1a75ff' width={'15px'} />
                                                        </a>
                                                        {file.substring(file.lastIndexOf('/') + 1)}
                                                    </>
                                                }
                                            </>
                                        }
                                    />
                                    {errors.file && <FormFeedback className='d-block'>{errors.file.message}</FormFeedback>}
                                </div>
                                <div className="mb-2">
                                    <Label className="form-label">
                                        {t('Зориулж')}
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
                                                isDisabled={!edit}
                                            />
                                        )}
                                    />
                                    {errors.stype && <FormFeedback className='d-block'>{errors.stype.message}</FormFeedback>}
                                </div>
                                {
                                    edit &&
                                    <Button className="me-2" color="primary" type="submit">
                                        {t('Хадгалах')}
                                    </Button>
                                }
                            </fieldset>
                        </Form>
                    </CardBody>
                </Card>
            </Col>
            <Col md={8}>
                <DataTable
                    className='react-dataTable'
                    progressPending={isLoading}
                    progressComponent={
                        <div className='my-2 d-flex align-items-center justify-content-center'>
                            <Spinner className='me-1' color="" size='sm' /><h5>{t('Түр хүлээнэ үү')}...</h5>
                        </div>
                    }
                    noDataComponent={(
                        <div className="my-2">
                            <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                        </div>
                    )}
                    columns={[
                        {
                            name: "№",
                            selector: (row, index) => index + 1,
                            center: true,
                            maxWidth: '100px'
                        },
                        {
                            header: 'title',
                            name: `${t('Гарчиг')}`,
                            selector: (row) => row?.title,
                        },
                        {
                            header: 'file',
                            name: `${t('Файл')}`,
                            selector: (row) =>
                                <>
                                    <a href={row?.file} className='me-1'>
                                        <Download type="button" color='#1a75ff' width={'15px'} />
                                    </a>
                                    {row?.file.substring(row?.file.lastIndexOf('/') + 1)}
                                </>,
                            minWidth: '200px'
                        },
                        {
                            header: 'stype',
                            name: `${t('Зориулж')}`,
                            selector: (row) => stype_options.find(item => item.value === row?.stype)?.label,
                            maxWidth: '100px'
                        },
                        {
                            header: 'created_at',
                            name: `${t('Огноо')}`,
                            selector: (row) => moment(row?.created_at).format('YYYY-MM-DD HH:mm:ss'),
                            minWidth: '180px'
                        },
                        {
                            header: 'created_by',
                            name: `${t('Хэрэглэгч')}`,
                            selector: (row) => row?.created_by,
                            minWidth: '150px'
                        }
                    ]}
                    data={data}
                />
            </Col>
        </Row>
    )
}

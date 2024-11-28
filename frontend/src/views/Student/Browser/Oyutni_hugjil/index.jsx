import { t } from "i18next"
import { useState, useContext, useEffect } from "react"
import DataTable from "react-data-table-component"

import { Edit, Download, Trash2 } from 'react-feather'
import { useForm, Controller } from "react-hook-form";

import { Card, CardBody, Form, CardHeader, CardTitle, Col, Row, Input, Label, Button, Spinner, Badge, FormFeedback } from "reactstrap"
import { validate } from '@utils'
import AuthContext from '@context/AuthContext'
import useApi from "@hooks/useApi"
import useLoader from '@hooks/useLoader';
import useModal from '@hooks/useModal';
import * as Yup from 'yup';
import { getPagination } from '@utils'

import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css'


const Oyutni_hugjil = () => {

     // Loader
    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: true})

    //Context
    const { user } = useContext(AuthContext)

    const { showWarning } = useModal()

    //useState
    const [currentPage, setCurrentPage] = useState(1);
    const [total_count, setTotalCount] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const [datas, setDatas] = useState([])
    const [fileInputKey, setFileInputKey] = useState(0); //
    const [edit, setEdit] = useState(false)

    const [value, setValues] = useState('');

    const {quill, quillRef } = useQuill({
        modules: {
            toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ align: [] }],

                    [{ list: 'ordered'}, { list: 'bullet' }],
                    [{ indent: '-1'}, { indent: '+1' }],

                    [{ size: ['small', false, 'large', 'huge'] }],
                    ['link',],

                    [{ color: [] }, { background: [] }],

                    ['clean'],
            ],
        },
        value: value,
        theme: 'snow',
        formats: [
            'header','bold', 'italic', 'underline', 'strike',
            'align', 'list', 'indent',
            'size',
            'link',
            'color', 'background',
            'clean',
        ],
        readOnly: false,
    });


    const validationSchema = Yup.object().shape({
        title: Yup.string()
            .trim()
            .required(t('Хоосон байна')),
        file: Yup.mixed()
            .test(
                'file-required',
                t('Хоосон байна'),
                (value) => (value instanceof FileList && value.length > 0) || (typeof value === 'string' && value.trim() !== '')
            )
            .test(
                'file-format-required',
                t('Choose PDF or Excel files'),
                (value) => (typeof value === 'string' && value.trim() !== '') ||
                    (
                        value && value.length > 0 &&
                        ['application/pdf'].includes(value[0].type)
                    )
            ),
        stype: Yup.object({
            value: Yup.number()
                .transform(value => (isNaN(value) ? undefined : value))
                .required(t('Хоосон байна'))
        })
            .nullable()
            .required(t('Хоосон байна'))
    });

    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
        watch,
        reset
    } = useForm(validate(validationSchema));

    const file = watch('file')
    console.log( file, 'file')
    const studentDevelopApi = useApi().browser.student_develop

    async function getDatas() {
        const { success, data } = await fetchData(studentDevelopApi.get(rowsPerPage, currentPage))
        if (success) {
            setDatas(data?.results)
        }
    }

    useEffect(() => {
        getDatas()
    }, [currentPage, rowsPerPage])

    /* Устгах функц */
    const handleDelete = async(id) => {
        const { success } = await fetchData(studentDevelopApi.delete(id))
        if(success)
        {
            getDatas()
        }
    };

    // Хадгалах
	async function onSubmit(cdata) {
        console.log("cdata", cdata);
        const formData = new FormData()
        for (const key in cdata) {
            if (key === 'file' && cdata[key] instanceof FileList)
                formData.append(key, cdata[key][0], cdata[key][0].name)
            else
                formData.append(key, cdata[key])
        }

        // cdata['body'] = quill.root.innerHTML
        // cdata['created_user'] = user.id
        // cdata['updated_user'] = user.id

        const { success, errors } = await fetchData(studentDevelopApi.post(formData))
        if(success) {
            reset()
            setFileInputKey((prevKey) => prevKey + 1);
            setEdit(false)
            getDatas()
        }
        else {
            if(errors && Object.keys(errors).length > 0) {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in errors) {
                    setError(key, { type: 'custom', message: errors[key][0]});
                }
            }
        }
    }

    return (
        <Row>
            <Col md="4">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('Их сургуулийн бүтэц зохион байгуулалт')}</CardTitle>
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
                                        {t('Линк')}
                                    </Label>
                                    <Controller
                                        defaultValue=""
                                        control={control}
                                        name="link"
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                id={field.name}
                                                type="text"
                                                placeholder={t("Линк")}
                                                invalid={errors[field.name] && true}
                                            />
                                        )}
                                    />
                                    {errors.link && <FormFeedback className='d-block'>{errors.link.message}</FormFeedback>}
                                </div>
                                <div>
                                    <Label className='form-label'>
                                        {t('Танилцуулга байршуулах хэсэг')}
                                    </Label>
                                    <Controller
                                        defaultValue=''
                                        control={control}
                                        id='body'
                                        name='body'
                                        render={({field}) => (
                                            <div style={{ width: 'auto',}}>
                                                <div
                                                    {...field}
                                                    id={field.body}
                                                    ref={quillRef}
                                                />
                                            </div>
                                        )}
                                    />
                                    {errors.body && <FormFeedback className='d-block'>{t(errors.body.message)}</FormFeedback>}
                                </div>
                                <div className="mt-1 mb-1">
                                    <Label className="form-label">
                                        {t('Файл')}
                                    </Label>
                                    <Controller
                                        defaultValue=""
                                        control={control}
                                        name="file"
                                        render={({ field }) =>
                                            <>
                                                <Input
                                                    key={fileInputKey}
                                                    name={field.name}
                                                    id={field.name}
                                                    type="file"
                                                    placeholder={t("файл")}
                                                    accept="application/pdf"
                                                    onChange={(e) => field.onChange(e.target.files)}
                                                />
                                                {file && typeof file === 'string' &&
                                                    <>
                                                        <a href={file} className='me-1'>
                                                            <Download type="button" color='#1a75ff' width={'15px'} />
                                                        </a>
                                                        {file}
                                                    </>
                                                }
                                            </>
                                        }
                                    />
                                    {errors.file && <FormFeedback className='d-block'>{errors.file.message}</FormFeedback>}
                                </div>
                                {
                                    edit &&
                                    <Button className="me-2" color="primary" type="submit" disabled={!isValid}>
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
                            name: <Trash2 width={"15px"} />,
                            selector: (row) => (
                                <a
                                    role='button'
                                    className='ms-1'
                                    onClick={() => showWarning({
                                        header: {
                                            title: t(`Файл устгах`),
                                        },
                                        question: t(`Та ${row?.title} устгахдаа итгэлтэй байна уу?`),
                                        onClick: () => handleDelete(row?.id),
                                        btnText: t('Устгах'),
                                    })}
                                    id={`complaintListDatatableCancel${row?.id}`}
                                >
                                    <Badge color="light-danger" pill><Trash2 width={"15px"} /></Badge>
                                </a>
                            ),
                            center: true,
                            minWidth: "100px",
                            maxWidth: "100px",
                        },
                        {
                            name: "№",
                            selector: (row, index) => index + 1,
                            center: true,
                            minWidth: "150px",
                            maxWidth: "150px",
                        },
                        {
                            header: 'title',
                            name: `${t('Гарчиг')}`,
                            selector: (row) => <div className="heightThreeDots" title={row?.title}>{row?.title}</div>,
                            minWidth: '150px',
                            maxWidth: '150px',
                        },
                        {
                            name: `${t('link')}`,
                            selector: (row) => <a href={row?.link} className="ms-1"><div className="heightThreeDots" title={row?.link}>{row?.link}</div></a>,
                            minWidth: "200px",
                            center: true
                        },
                        {
                            header: 'file',
                            name: `${t('Файл')}`,
                            selector: (row) =>
                                <>
                                    <a href={row?.file} className='me-1'>
                                        <Download type="button" color='#1a75ff' width={'15px'} />
                                    </a>
                                    {row?.file ? decodeURIComponent(row?.file.toString().split("/").pop()): ''}
                                </>,
                            minWidth: '300px'
                        },
                    ]}
                    data={datas}
                />
            </Col>
        </Row>
    )
}
export default Oyutni_hugjil
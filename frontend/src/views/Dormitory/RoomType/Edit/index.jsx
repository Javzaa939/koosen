import React, { Fragment, useEffect, useState } from "react";

import { Controller, useForm } from 'react-hook-form'

import {
    Row,
    ModalBody,
    ModalHeader,
    Col,
    FormFeedback,
    Table,
    Input,
    Form,
    Modal,
    Label,
    Button,
    Badge,
    Spinner,
    UncontrolledTooltip
} from 'reactstrap'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import { validate, convertDefaultValue, ReactSelectStyles, get_rent_type } from "@utils"

import { validateSchema } from "../validateSchema";

import Select from 'react-select'
import classnames from "classnames";

import { t } from 'i18next';

import { X, Trash2 } from 'react-feather'

const EditModal = ({ open, handleEdit, editId, refreshDatas }) => {

    const [featurefile, setFeaturedImg] = useState([])
    const [upFiles, setUpFiles] = useState([])
    const [all_files, setAllFiles] = useState([])
    const [rentTypeOption, setRentType] = useState(get_rent_type())
    const [edit_file, setEditFile] = useState({})
    const [descriptionValue, setDescription] = useState('')

    // Файл шинээр оруулсан бол true
    const [is_new_upload_file, setUploadNewFile] = useState(false)

    // ** Hook
    const { control, handleSubmit, setValue, setError, formState: { errors }, reset } = useForm(validate(validateSchema))

    const { isLoading, Loader, fetchData } = useLoader({})

    // Api
    const roomTypeApi = useApi().dormitory.type

    async function getDatas() {
        if(editId) {
            const { success, data } = await fetchData(roomTypeApi.getOne(editId))
            if(success) {
                setAllFiles(data?.files)
                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                if(data === null) return
                for(let key in data) {
                    if(data[key] !== null)
                        setValue(key, data[key])
                    else setValue(key, '')

                }
            }
        }
    }

    useEffect(() => {
        getDatas()
    },[open])

    const onChangeFile = (e, action) => {
        setUploadNewFile(true)
        if(action == 'Get_File') {
            const files = Array.prototype.slice.call(e.target.files)
            const hereFiles = [...upFiles]
            files.map(file => {
                if(file) hereFiles.push({file: file, description: descriptionValue})
            })
            setFeaturedImg(hereFiles)
            setUpFiles(hereFiles)
        }
        else {
            const herFiles = featurefile.splice(action, 1)
            setUpFiles(herFiles)
        }
    }

    async function handleDelete (fileID) {
        const { success } = await fetchData(roomTypeApi.fileDelete(fileID))
        if(success) {
            getDatas()
        }
    }

    async function onSubmit(cdata) {
        cdata = convertDefaultValue(cdata)
        if(editId) {

            const formData = new FormData()

            if(featurefile && featurefile.length > 0) {
                featurefile.forEach((file) => {
                    if(is_new_upload_file) {
                        formData.append('files', file.file, file.file.name);
                    }
                    else {
                        formData.append('files', file.file);
                        if(file?.file_change) {
                            formData.append('files', file.file, file.file.name);
                        }
                        formData.append('file_change', file?.file_change || false);
                        formData.append('file_id', file?.id);
                    }
                    formData.append('descriptions', file.description);
                });
            }

            for (let key in cdata) {
                formData.append(key, cdata[key])
            }
            const { success } = await fetchData(roomTypeApi.put(formData, editId))
            if(success) {
                reset()
                handleEdit()
                refreshDatas()
            }
        }
    }

    return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleEdit}
                className="modal-dialog-centered modal-lg"
                onClosed={handleEdit}
            >
                {isLoading && <div className='suspense-loader'><Spinner size='xl'/></div>}
                <ModalHeader
                    className="bg-transparent pb-0"
                    toggle={handleEdit}
                    >
                </ModalHeader>
                <ModalBody className="px-sm-3 pt-50 pb-3">
                    <div className="text-center">
                        <h5>{t('Өрөөний төрөл засах')}</h5>
                    </div>
                    <Row tag={Form} className='gy-1' onSubmit={handleSubmit(onSubmit)}>
                        <Col md={6}>
                            <Label className='form-label' for="name">
                                {t('Өрөөний төрлийн нэр')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='name'
                                name='name'
                                render={({field}) => (
                                    <Input
                                        {...field}
                                        type='text'
                                        name='name'
                                        id='name'
                                        placeholder={t('Өрөөний төрлийн нэр')}
                                        bsSize='sm'
                                        invalid={errors.name && true}
                                    />
                                )}
                            />
                            {errors.name && <FormFeedback className='d-block'>{t(errors.name.message)}</FormFeedback>}
                        </Col>
                        <Col md={6}>
                            <Label className='form-label' for='rent_type'>
                                {t('Түрээсийн төрөл')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="rent_type"
                                render={({ field: { value, onChange } }) => {
                                    return (
                                        <Select
                                            name="rent_type"
                                            id="rent_type"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', {'is-invalid': errors.rent_type})}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={rentTypeOption || []}
                                            value={rentTypeOption.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            />
                            {errors.rent_type && <FormFeedback className='d-block'>{t(errors.rent_type.message)}</FormFeedback>}
                        </Col>
                        <Col md={6}>
                            <Label className='form-label' for="description">
                                {t('Тайлбар')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='description'
                                name='description'
                                render={({field}) => (
                                    <Input
                                        {...field}
                                        type='textarea'
                                        name='description'
                                        id='description'
                                        placeholder={t('Энд дэлгэрэнгүй мэдээлэл оруулна')}
                                        bsSize='sm'
                                        invalid={errors.description && true}
                                    />
                                )}
                            />
                            {errors.description && <FormFeedback className='d-block'>{t(errors.description.message)}</FormFeedback>}
                        </Col>
                        <Col md={6}>
                            <Label className='form-label' for='volume'>
                                {t('Өрөөний багтаамж')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='volume'
                                name='volume'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type='number'
                                        name='volume'
                                        id='volume'
                                        bsSize='sm'
                                        placeholder={t('Өрөөний багтаамж')}
                                        invalid={errors.volume && true}
                                    >
                                    </Input>
                                )}
                            />
                            {errors.volume && <FormFeedback className='d-block'>{t(errors.volume.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            {
                                all_files && all_files.length > 0
                                &&
                                    <Table size='sm' bordered responsive>
                                        <thead>
                                            <tr>
                                                <th>Тайлбар</th>
                                                <th>Файл</th>
                                                <th className='text-center'>Устгах</th>
                                            </tr>
                                        </thead>
                                        <tbody >
                                            {
                                                all_files.map((file, idx) => {
                                                    return (
                                                        <tr key={idx}>
                                                            <td id={`desc${idx}`} className="bg-transparent">{file?.description || t('Хоосон байна')}</td>
                                                            <td id={`file${file?.id}`} className=" bg-transparent cursor-default ">
                                                                { file?.file_change ? file?.file?.name : file?.file.toString().split("/").pop()}
                                                            </td>
                                                            <td id={`delete${idx}`} className='text-center bg-transparent'>
                                                                <a role="button" onClick={() => handleDelete(file.id)}>
                                                                    <Badge color="light-danger" pill><X width={"100px"} /></Badge>
						                                        </a>
                                                            </td>
                                                            {/* <UncontrolledTooltip placement="top" className="d-inline-block" target={`file${file.id}`}>
                                                                <img className="w-75" src={file?.file}/>
                                                            </UncontrolledTooltip> */}
                                                        </tr>
                                                    )
                                                })
                                            }
                                        </tbody>

                                    </Table>
                                }
                                <div className='border rounded p-2 pt-50'>
                                    <Col md={12}>
                                        <Label for='description'>
                                            {t('Файлын тайлбар')}
                                        </Label>
                                        <Controller
                                            name='description'
                                            control={control}
                                            defaultValue=''
                                            render={({ field }) => {
                                                field.value = field.value ? field.value : ''
                                                return (
                                                    <Input
                                                        id='description'
                                                        type="text"
                                                        bsSize='sm'
                                                        placeholder={t('Файлын тайлбар')}
                                                        value={descriptionValue}
                                                        onChange={(e) => setDescription(e.target.value)}
                                                    />
                                                )
                                            }}
                                        />
                                    </Col>
                                    <Col md={12} >
                                        <Label for='file'>
                                            Файл
                                        </Label>
                                        <Controller
                                            name='file'
                                            control={control}
                                            defaultValue=''
                                            render={({ field }) => {
                                                field.value = field.value ? field.value : ''
                                                return (
                                                    <Input
                                                        {...field}
                                                        id='file'
                                                        type="file"
                                                        bsSize='sm'
                                                        multiple accept="image/*"
                                                        onChange={(e) => onChangeFile(e, 'Get_File')}
                                                    />
                                                )
                                            }}
                                        />
                                    </Col>
                                    <Col md={12} className='mt-50'>
                                        {
                                            featurefile.map((card, index) => {
                                                return (
                                                    <div key={index}>
                                                        {
                                                            card.description || card?.file?.name
                                                        }
                                                        <X className='ms-50' role="button" color="red" size={15} onClick={(e) => onChangeFile(e, index)}></X>
                                                    </div>
                                                )
                                            })
                                        }
                                    </Col>
                                </div>
                        </Col>
                        <Col md={12} className="text-center mt-2">
                            <Button className='me-2' color="primary" type="submit">
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" outline type="reset" onClick={handleEdit}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
    )
}


export default EditModal

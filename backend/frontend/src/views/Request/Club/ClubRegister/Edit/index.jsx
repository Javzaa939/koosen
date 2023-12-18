import React, { Fragment, useState, useEffect } from 'react'

import { Controller, useForm } from 'react-hook-form'

import { Modal, ModalHeader, ModalBody, Row, Col, Label, Form, Input, Button, FormFeedback, Spinner, Table, Badge, UncontrolledTooltip } from 'reactstrap'

import useApi from '@hooks/useApi';

import useModal from "@hooks/useModal"

import useLoader from '@hooks/useLoader';

import Select from 'react-select'

import { useTranslation } from 'react-i18next'

import classnames from 'classnames'

import { Plus, Download, Trash2, Edit } from 'react-feather'

import { convertDefaultValue, validate, ReactSelectStyles, club_type_option } from '@utils'

import { validateSchema } from '../validateSchema';

import EditFile from '../Edit/Modal/EditFile';

const EditModal = ( props ) => {

    const { isOpen, editId, handleModal, refreshDatas, is_edit } = props

    const { t } = useTranslation()

    const { showWarning } = useModal()

    // ** Hook
    const { control, handleSubmit, formState: { errors }, setValue, reset, setError } = useForm(validate(validateSchema));

    const { isLoading, Loader, fetchData } = useLoader({ isFullScreen: true })

    const [is_loading, setIsLoading] = useState(false)
    const [all_files, setAllFiles] = useState([])
    const [featurefile, setFeaturedImg] = useState([])
    const [upFiles, setUpFiles] = useState([])
    const [edit_file, setEditFile] = useState({})
    const [delete_ids, setDeleteIds] = useState([])
    const [is_add_file, setAddFile] = useState(false)
    const [is_edit_file, setIsEditFile] = useState(false)

    // Api
    const clubApi = useApi().request.club

    async function getOneDatas() {
        const { success, data } = await fetchData(clubApi.getOne(editId))
        if(success) {
            // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
            if(data === null) return
            for(let key in data) {
                if(key === 'files') setAllFiles(data[key])
                if(data[key] !== null)
                    setValue(key, data[key])
                else setValue(key, '')
            }
        }
    }

    function handleChangeFile(files) {
        const hereFiles = upFiles
        if(!hereFiles.includes(files)) {
            hereFiles.push(files)
        }
        setFeaturedImg(hereFiles)

        setAllFiles(prev => {
            const newAllFiles = [...prev]
            if(!newAllFiles.includes(files)) {
                newAllFiles.push(files)
            }
            return newAllFiles
        })

    }

    useEffect(() => {
        if(delete_ids && delete_ids.length > 0 && featurefile && featurefile.length > 0) {
            const newFiles = featurefile
            newFiles.map((file, idx) => {
                if(delete_ids.includes(file?.id)) {
                    newFiles.splice(idx, 1)
                }
            })
            setFeaturedImg(newFiles)
        }
    },[delete_ids, featurefile])

    useEffect(() => {
        if (editId) getOneDatas()
    }, [isOpen])

    async function onSubmit(cdata) {
        cdata = convertDefaultValue(cdata)
        const formData = new FormData()

        if(editId) {
            if(featurefile && featurefile.length > 0) {
                featurefile.forEach((file) => {
                    if(file?.file_change) {
                        formData.append('files', file.file, file.file.name);
                    }
                    else {
                        formData.append('files', new Blob());
                    }
                    formData.append('file_change', file?.file_change || false);
                    formData.append('file_id', file?.id || '');
                    formData.append('descriptions', file.description);
                });
            }

            if(delete_ids && delete_ids.length > 0) {
                delete_ids.map((id) => {
                    formData.append('delete_ids', id)
                })
            }

            for (let key in cdata) {
                formData.append(key, cdata[key])
            }

            const { success, error } = await fetchData(clubApi.put(formData, editId))
            if(success) {
                reset()
                refreshDatas()
                handleModal()
            } else {
                /** Алдааны мессеж */
                for (let key in error) {
                    setError(error[key].field, { type: 'custom', message: error[key].msg});
                }
            }
        }
    }

    // Засах
    function handleEdit(idx, check) {
        var edit_file = {}
        if(idx || idx === 0) {
            edit_file = all_files[idx]
        }
        setEditFile(edit_file)
        setAddFile(check)
        setIsEditFile(!is_edit_file)
    }

    // Устгах
    function handleDelete(id, index) {
        if (index > -1) {
            all_files.splice(index, 1);
        }
        setDeleteIds(prev => {
            const newIds = [...prev]
            if(id && !newIds.includes(id)) {
                newIds.push(id)
            }
            return newIds
        })
    }

    return (
        <Fragment>
            <Modal isOpen={isOpen} toggle={handleModal} className="modal-dialog-centered" onClosed={handleModal}>
            {isLoading && <div className='suspense-loader'><Spinner size='xl'/></div>}
                <ModalHeader className='bg-transparent pb-0' toggle={handleModal}></ModalHeader>
                <ModalBody className="px-sm-3 pt-50 pb-3">
                    <Row tag={Form} className='gy-1' onSubmit={handleSubmit(onSubmit)}>
                        <Col md={6}>
                            <Label className='form-label' for='name'>
                                {t('Нэр')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='name'
                                name='name'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type='text'
                                        name='name'
                                        id='name'
                                        bsSize='sm'
                                        disabled={!is_edit}
                                        readOnly={!is_edit}
                                        placeholder={t('Нэр')}
                                        invalid={errors.name && true}
                                    />
                                )}
                            />
                            {errors.name && <FormFeedback className='d-block'>{t(errors.name.message)}</FormFeedback>}
                        </Col>
                        <Col md={6}>
                            <Label className='form-label' for='type'>
                                {t('Үйл ажиллагааны чиглэл')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="type"
                                render={({ field: { value, onChange } }) => {
                                    return (
                                        <Select
                                            name="type"
                                            id="type"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', {'is-invalid': errors.type && true})}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={club_type_option || []}
                                            value={club_type_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            isDisabled={!is_edit}
                                            readOnly={!is_edit}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            />
                            {errors.type && <FormFeedback className='d-block'>{t(errors.type.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className='form-label' for='purpose'>
                                {t('Зорилго')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='purpose'
                                name='purpose'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type='textarea'
                                        name='purpose'
                                        id='purpose'
                                        bsSize='sm'
                                        rows="4"
                                        disabled={!is_edit}
                                        readOnly={!is_edit}
                                        placeholder={t('Зорилго')}
                                        invalid={errors.purpose && true}
                                    />
                                )}
                            />
                            {errors.purpose && <FormFeedback className='d-block'>{t(errors.purpose.message)}</FormFeedback>}
                        </Col>
                        <Col md={6}>
                            <Label className='form-label' for='start_year'>
                                {t('Байгуулагдсан он')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='start_year'
                                name='start_year'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type='number'
                                        name='start_year'
                                        id='start_year'
                                        bsSize='sm'
                                        disabled={!is_edit}
                                        readOnly={!is_edit}
                                        placeholder={t('Байгуулагдсан он')}
                                        invalid={errors.start_year && true}
                                        onKeyDown={(e) =>["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                                    />
                                )}
                            />
                            {errors.start_year && <FormFeedback className='d-block'>{t(errors.start_year.message)}</FormFeedback>}
                        </Col>
                        <Col md={6}>
                            <Label className='form-label' for='member_count'>
                                {t('Идэвхтэй гишүүдийн тоо')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='member_count'
                                name='member_count'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type='number'
                                        name='member_count'
                                        id='member_count'
                                        bsSize='sm'
                                        disabled={!is_edit}
                                        readOnly={!is_edit}
                                        placeholder={t('Идэвхтэй гишүүдийн тоо')}
                                        invalid={errors.member_count && true}
                                        onKeyDown={(e) =>["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                                    />
                                )}
                            />
                            {errors.member_count && <FormFeedback className='d-block'>{t(errors.member_count.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className='form-label' for='leader'>
                                {t('Удирдагчийн мэдээлэл')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='leader'
                                name='leader'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type='text'
                                        name='leader'
                                        id='leader'
                                        bsSize='sm'
                                        disabled={!is_edit}
                                        readOnly={!is_edit}
                                        placeholder={t('Удирдагчийн мэдээлэл')}
                                        invalid={errors.leader && true}
                                    />
                                )}
                            />
                            {errors.payment && <FormFeedback className='d-block'>{t(errors.payment.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            {
                                all_files && all_files.length > 0 &&
                                <Table size='sm' bordered responsive>
                                    <thead>
                                        <tr>
                                            <th>Тайлбар</th>
                                            <th>Файл</th>
                                            <th className='text-center'>Үйлдэл</th>
                                        </tr>
                                    </thead>
                                    <tbody >
                                        {
                                            all_files.map((file, idx) => {
                                                return (
                                                    <tr key={idx}>
                                                        <td><small>{file?.description || t('Хоосон байна')}</small></td>
                                                        <td>
                                                            <small>
                                                                { (file?.file_change || file?.is_new_file) ? file?.file?.name : file?.file.toString().split("/").pop()}
                                                            </small>
                                                        </td>
                                                        <td className='text-center'>
                                                            <a
                                                                href={file?.file}
                                                                className={`${!file?.id ? ` pe-none opacity-25 ` : `` } ms-1`}

                                                                id={`complaintListDatatableDownload${file.id}`}
                                                            >
                                                                <Badge color="light-info" pill><Download  width={"15px"} /></Badge>
                                                            </a>

                                                            <UncontrolledTooltip placement='top' target={`complaintListDatatableDownload${file.id}`}>Татах</UncontrolledTooltip>
                                                            <a
                                                                role="button"
                                                                className={`ms-1`}
                                                                onClick={() => handleEdit(idx, false)}
                                                                id={`complaintListDatatableUpdate${idx}`}
                                                            >
                                                                <Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
                                                            </a>

                                                            <UncontrolledTooltip placement='top' target={`complaintListDatatableUpdate${idx}`}>Засах</UncontrolledTooltip>

                                                            <a
                                                                role="button"
                                                                className={`ms-1`}
                                                                onClick={() => showWarning({
                                                                    question: t(`Та энэ мэдээллийг устгахдаа итгэлтэй байна уу?`),
                                                                    onClick: () => handleDelete(file.id, idx),
                                                                    btnText: t("Устгах")
                                                                })}
                                                                id={`complaintListDatatableDelete${file.id}`}
                                                            >
                                                                <Badge color="light-danger" pill><Trash2  width={"15px"} /></Badge>
                                                            </a>

                                                            <UncontrolledTooltip placement='top' target={`complaintListDatatableDelete${file.id}`}>Устгах</UncontrolledTooltip>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        }
                                    </tbody>
                                </Table>
                            }
                            {
                                is_edit &&
                                <div className='text-center mt-50'>
                                    <Button outline size='sm' color="primary" onClick={() => handleEdit('', true)}>
                                        <Plus size={15} />{t('Файл нэмэх')}
                                    </Button>
                                </div>
                            }
                        </Col>
                        {
                            is_edit &&
                            <Col md={12} className="mt-2 text-center">
                                <Button className='me-2' color="primary" type="submit">
                                    {t('Хадгалах')}
                                </Button>
                                <Button color="secondary" outline type="reset" onClick={handleModal}>
                                    {t('Буцах')}
                                </Button>
                            </Col>
                        }
                    </Row>
                    {
                        is_edit_file && <EditFile open={is_edit_file} file_change_type={is_add_file} handleUpdate={handleEdit} edit_file={edit_file} handleChangeFile={handleChangeFile} />
                    }
                </ModalBody>
            </Modal>
        </Fragment>
    )
}

export default EditModal


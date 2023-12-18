// ** React imports
import React, { Fragment, useState, useEffect, useRef } from 'react'

import { useForm, Controller } from "react-hook-form";

import {
    Row,
    Col,
	Form,
	Modal,
	Input,
	Label,
	Button,
	ModalBody,
	ModalHeader,
    FormFeedback,
} from "reactstrap";

import { t } from 'i18next';

import useToast from '@hooks/useToast'

import { isObjEmpty } from '@utils'

const EditFile = ({ open, file_change_type, handleUpdate, edit_file, handleChangeFile }) => {

    // ** Hook
    const { control, handleSubmit, reset, setValue } = useForm({});

    const fileInputRef = useRef(null)
    const addToast = useToast()

    // State
	const [upload_file, setFile] = useState("");

    // Файл оруулах үед файлыг авна
	const onChangeFile = (e, action) => {
		if (action == "Get_File") {
			const file = e.target.files[0];
			setFile(file);
		} else {
			setFile("");
		}
	};

    useEffect(() => {
        setValue('description', edit_file?.description)
    },[edit_file])

    async function onSubmit(cdata) {
        if(upload_file || !isObjEmpty(edit_file)) {
            if(upload_file) {
                edit_file.file = upload_file
                edit_file.file_change = true
                edit_file.is_new_file = false
                edit_file.description = cdata.description
                if(file_change_type) {
                    edit_file.is_new_file = true
                }
            } else {
                edit_file.file_change = false
            }
            edit_file.description = cdata.description
            handleChangeFile(edit_file)
            reset()
            handleUpdate()
            setFile('')
        } else {
            addToast(
                {
                    type: 'warning',
                    text: 'Та файл оруулна уу !!!'
                }
            )
        }
	}

	return (
        <Fragment>
            <Modal isOpen={open} toggle={handleUpdate} className="modal-dialog-centered modal-lg" onClosed={handleUpdate}>
                <ModalHeader className='bg-transparent pb-0' toggle={handleUpdate} ></ModalHeader>
                <ModalBody className="px-sm-3 pt-30 pb-3">
                    <div className='text-center'>
                        <h4>{t('Файл')}</h4>
                    </div>
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
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
                                                    {...field}
                                                    id='description'
                                                    type="text"
                                                    bsSize='sm'
                                                    placeholder={t('Файлын тайлбар')}
                                                />
                                            )
                                        }}
                                    />
                                </Col>
                                <Col md={12} className="mt-50">
                                    <Label for='file'>
                                        Файл
                                    </Label>
                                    <Controller
                                        name='file'
                                        control={control}
                                        defaultValue=''
                                        render={({ field }) => {
                                            return (
                                                <Input
                                                    {...field}
                                                    id='file'
                                                    type="file"
                                                    bsSize='sm'
                                                    ref={fileInputRef}
                                                    onChange={(e) => onChangeFile(e, 'Get_File')}
                                                />
                                            )
                                        }}
                                    />
                                </Col>
                                <Row className='mt-50'>
                                    <div>
                                        {
                                            upload_file
                                            ?
                                                upload_file.name
                                            :
                                                edit_file?.file_change || edit_file?.is_new_file
                                                ?
                                                    edit_file?.file?.name
                                                :
                                                    (edit_file?.file && edit_file?.file.toString().split("/").pop()) || ''
                                        }
                                    </div>
                                </Row>
                            </div>
                        </Col>
                        <Col md={12} className="text-center mt-2">
                            <Button className="me-2" color="primary" type="submit">
                                {
                                    file_change_type
                                    ?
                                        t('Нэмэх')
                                    :
                                        t('Засах')
                                }
                            </Button>
                            <Button color="secondary" type="reset" outline onClick={handleUpdate}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
	);
};
export default EditFile;



// ** React imports
import React, { useState, useEffect, useContext, Fragment } from 'react'

import { useTranslation } from 'react-i18next';

import useApi from "@hooks/useApi";

import useLoader from "@hooks/useLoader";

import { useQuill } from 'react-quilljs';

import 'quill/dist/quill.snow.css'

import { useForm, Controller } from "react-hook-form";

import { useParams } from 'react-router-dom';

import {
    Row,
    Col,
	Button,
	Card,
    CardHeader,
    CardBody,
    Form,
    Label,
    Spinner
} from "reactstrap";

import AuthContext from "@context/AuthContext"

import SchoolContext from "@context/SchoolContext"

import { validate, convertDefaultValue } from "@utils"
import { eventListeners } from '@popperjs/core';

const Introduction = ({ }) => {

    const { t } = useTranslation()

    const { definition_Id } = useParams()

    const { user } = useContext(AuthContext)

    const { school_id } = useContext(SchoolContext)

    useEffect(() => {
        if (Object.keys(user).length > 0 && user.permissions.includes('lms-study-profession-update') && school_id)
        {
            setValid(false)
        }
    },[user])

    // State
    const [ value, setValues ] = useState('')
    const [ is_loading, setLoading ] = useState(false)
    const [ is_valid, setValid ] = useState(true)

    // ** Hook
    const { control, handleSubmit, reset, setValue, setError, formState: { errors } } = useForm();

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});

    // Api
    const definationApi = useApi().study.professionDefinition

    const {quill, quillRef } = useQuill({
        modules: {
            toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ align: [] }],

                    [{ list: 'ordered'}, { list: 'bullet' }],
                    [{ indent: '-1'}, { indent: '+1' }],

                    [{ size: ['small', false, 'large', 'huge'] }],
                    ['link', 'image',],

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
            'link', 'image',
            'color', 'background',
            'clean',
        ],
        readOnly: false,
    });

    async function getDatas() {
        if(definition_Id) {
            const { success, data } = await fetchData(definationApi.getOne(definition_Id))
            if(success) {
                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                if(data === null) return
                for(let key in data) {
                    if(data[key] == null)
                        setValue(key,'')
                    else {
                        setValue(key, data[key])
                    }
                    if (key === 'introduction' && quill) {
                        quill.pasteHTML(data[key]);
                    }
                }
            }
        }
    }

    useEffect(() => {
        getDatas()
    }, [quill])

    async function onSubmit(cdata)
    {
        cdata['introduction'] = quill.root.innerHTML
        cdata = convertDefaultValue(cdata)

        const { success, error } = await fetchData(definationApi.putIntroduction(cdata, cdata?.id))
        if(success) {
            reset()
            getDatas()
        } else {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in error) {
                setError(error[key].field, { type: 'custom', message:  error[key].msg});
            }
        }
	}

    const insertToEditor = (url) => {
        const range = quill.getSelection();
        quill.insertEmbed(range.index, 'image', url);
    };

    async function saveToServer(file)  {
        const introduction = new FormData();
        introduction.append('file', file);

        const { success, data } = await fetchData(definationApi.saveFile(introduction))
        insertToEditor(data);
    };

    function selectLocalImage () {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = () => {
            const file = input.files[0];
            saveToServer(file);
        };
    };

    useEffect(() => {
        if (quill) {
            quill.getModule('toolbar').addHandler('image', selectLocalImage);
    }
    }, [quill]);


    return (
        <Fragment>
            <Card className="modal-dialog-lg">
            {isLoading && <div className='suspense-loader'><Spinner size='xl'/></div>}
                {/* <CardHeader className='bg-transparent pb-0' ><h4 className='text-center mb-3'>Танилцуулга</h4></CardHeader> */}
                <CardBody className="flex-grow-1">
                    <Row tag={Form} md={12} className="gy-1" onSubmit={handleSubmit(onSubmit)} >
                        <Col md={12}>
                            <Label className='form-label' for='introduction'>
                                {t('Танилцуулга хэсэг')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='introduction'
                                name='introduction'
                                render={({ field }) => (
                                    <div style={{ width: 'auto', isDisabled: true? 'none' : 'auto' }}>
                                        <div
                                            {...field}
                                            name='introduction'
                                            id='introduction'
                                            ref={quillRef}
                                        />
                                    </div>
                                )}
                            />
                        </Col>
                        <Col className='text-center mt-2' md={12}>
                            <Button className='me-2' disabled={is_valid} color="primary" type="submit">
                                {t('Хадгалах')}
                            </Button>
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        </Fragment>
    )
}

export default Introduction

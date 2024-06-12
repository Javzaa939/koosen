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

const validationSchema = Yup.object().shape({
    email_host_name: Yup.string()
		.trim()
		.required('Хоосон байна'),
    email_host: Yup.string()
		.trim()
		.required('Хоосон байна'),
    email_port: Yup.string()
		.trim()
		.required('Хоосон байна'),
    email_host_user: Yup.string()
		.trim()
		.required('Хоосон байна'),
    email_password: Yup.string()
		.trim()
		.required('Хоосон байна'),
});

export default function Mail() {

    const [edit, setEdit] = useState(false)

    const {
		control,
		handleSubmit,
        setValue,
		formState: { errors },
	} = useForm(validate(validationSchema));

    const configApi = useApi().hrms.school
    const { fetchData } = useLoader({})

    async function onSubmit(cdata) {
        const datas = convertDefaultValue(cdata)
        const { success } = await fetchData(configApi.put(datas))
        if (success) {
            setEdit(false)
        }
    }

    const getData = async() => {
        const { success, data } = await fetchData(configApi.get())
        if(success) {
            for(let key in data) {
                if(data[key] !== null)
                    setValue(key, data[key])
                else setValue(key,'')
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
                    <CardTitle>Мэйлийн тохиргоо</CardTitle>
                    <Edit size={20} onClick={() => setEdit(!edit)}/>
                </CardHeader>
                <CardBody>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <fieldset disabled={!edit}>
                            <div className="mb-2">
                                <Label className="form-label" for="email_host_name">
                                    EMAIL HOST NAME
                                </Label>
                                <Controller
                                    defaultValue="smtp.gmail.com"
                                    control={control}
                                    id="email_host_name"
                                    name="email_host_name"
                                    render={({ field }) => (
                                        <Input
                                            id="email_host_name"
                                            type="text"
                                            placeholder="hostname"
                                            invalid={errors.email_host_name && true}
                                            {...field}
                                        />
                                    )}
                                />
                                {errors.email_host_name && <FormFeedback className='d-block'>{errors.email_host_name.message}</FormFeedback>}
                            </div>
                            <div className="mb-2">
                                <Label className="form-label" for="email_host">
                                    EMAIL HOST
                                </Label>
                                <Controller
                                    defaultValue="smtp.gmail.com"
                                    control={control}
                                    id="email_host"
                                    name="email_host"
                                    render={({ field }) => (
                                        <Input
                                            id="email_host"
                                            type="text"
                                            placeholder="host"
                                            invalid={errors.email_host && true}
                                            {...field}
                                        />
                                    )}
                                />
                                {errors.email_host && <FormFeedback className='d-block'>{errors.email_host.message}</FormFeedback>}
                            </div>
                            <div className="mb-2">
                                <Label className="form-label" for="email_port">
                                    EMAIL PORT
                                </Label>
                                <Controller
                                    defaultValue="587"
                                    control={control}
                                    id="email_port"
                                    name="email_port"
                                    render={({ field }) => (
                                        <Input
                                            id="email_port"
                                            type="text"
                                            placeholder="port"
                                            invalid={errors.email_port && true}
                                            {...field}
                                        />
                                    )}
                                />
                                {errors.email_port && <FormFeedback className='d-block'>{errors.email_port.message}</FormFeedback>}
                            </div>
                            <div className="mb-2">
                                <Label className="form-label" for="email_host_user">
                                    EMAIL HOST USER
                                </Label>
                                <Controller
                                    defaultValue=""
                                    control={control}
                                    id="email_host_user"
                                    name="email_host_user"
                                    render={({ field }) => (
                                        <Input
                                            id="email_host_user"
                                            type="text"
                                            placeholder="user"
                                            invalid={errors.email_host_user && true}
                                            {...field}
                                        />
                                    )}
                                />
                                {errors.email_host_user && <FormFeedback className='d-block'>{errors.email_host_user.message}</FormFeedback>}
                            </div>
                            <div className="mb-2">
                                <Label className="form-label" for="email_password">
                                    EMAIL HOST PASSWORD
                                </Label>
                                <Controller
                                    defaultValue=""
                                    control={control}
                                    id="email_password"
                                    name="email_password"
                                    render={({ field }) => (
                                        <Input
                                            id="email_password"
                                            type="password"
                                            placeholder="password"
                                            invalid={errors.email_password && true}
                                            {...field}
                                        />
                                    )}
                                />
                                {errors.email_password && <FormFeedback className='d-block'>{errors.email_password.message}</FormFeedback>}
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

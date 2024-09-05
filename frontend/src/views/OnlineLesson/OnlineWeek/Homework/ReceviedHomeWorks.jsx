import React, { useContext, useEffect, useState } from "react";
import { X } from "react-feather";
import { Controller, useForm } from "react-hook-form";
import { Button, Col, Form, FormFeedback, FormGroup, Input, Label, ModalBody, ModalFooter, Row } from "reactstrap";
import { AuthContext } from "@src/utility/context/AuthContext";
import useApi from "@src/utility/hooks/useApi";
import useLoader from "@src/utility/hooks/useLoader";
import useToast from "@src/utility/hooks/useToast";

import { t } from 'i18next';

function ReceviedHomeWorks({ toggle, item }) {

    const addToast = useToast();
    const {  userDetail: user } = useContext(AuthContext);
    const homeworkAPI = useApi().homework;
    const [featurefile, setFeaturefile] = useState([]);

    const {
        control,
        formState: { errors },
        handleSubmit,
        setValue,
        reset,
        setError
    } = useForm({
        defaultValues: {
            created_user: user.id,
        },
    });

    const { fetchData: postFetch } = useLoader({});

    const onChangeFile = (e) => {
        const files = Array.from(e.target.files);
        setFeaturefile(files.map(file => ({ file })));
    };

    const calculateFutureDate = (weeks) => {
        const date = new Date();
        date.setDate(date.getDate() + weeks * 7);
        return date.toISOString().split(".")[0];
    };

    useEffect(() => {
        setFeaturefile([]);
    }, []);

    async function onSubmit(cdata) {
		cdata['week_id'] = item.id
		const formData = new FormData();

		Object.keys(cdata).forEach(key => {
			formData.append(key, (cdata[key] || ''));
		});

		featurefile.forEach((fileObj, index) => {
			formData.append(`file`, fileObj.file);
		});

		if(item?.homework) {
			const { success, errors } = await postFetch(homeworkAPI.put(formData, item?.homework))
			if(success) {
				reset();
				toggle();
			} else {
				/** Алдааны мессэжийг input дээр харуулна */
				for (let key in errors) {
					setError(key, { type: 'custom', message:  errors[key][0]});
				}
			}
		} else {
			const { success, errors } = await postFetch(homeworkAPI.post(formData))
			if(success) {
				reset();
				toggle();
			} else {
				/** Алдааны мессэжийг input дээр харуулна */
				for (let key in errors) {
					setError(key, { type: 'custom', message:  errors[key][0]});
				}
			}
		}
	}

    useEffect(() => {
		setFeaturefile([]);
		setValue('end_date', calculateFutureDate(16))
		setValue('start_date', calculateFutureDate(0))
	}, [])

    return (
        <Form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
            <ModalBody>
                <Row className="gy-1">
                    <Col md={6}>
                        <Label for="score">Дүгнэх оноо</Label>
                        <Controller
                            name="score"
                            control={control}
                            render={({ field }) => (
                                <Input {...field} type="number" step="0.01" invalid={errors?.score && true} />
                            )}
                        />
                        {errors.score && (
							<FormFeedback className="d-block">
								{t(errors.score.message)}
							</FormFeedback>
						)}
                    </Col>
                    <Col md={6}>
                        <Label for="description">Тайлбар</Label>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => <Input {...field} type="textarea" invalid={errors?.description && true} />}
                        />
                        {errors.description && (
							<FormFeedback className="d-block">
								{t(errors.description.message)}
							</FormFeedback>
						)}
                    </Col>
                    <Col md={6}>
                        <Label for="start_date">Эхлэх хугацаа</Label>
                        <Controller
                            name="start_date"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    type="datetime-local"
                                    invalid={errors?.start_date && true}
                                />
                            )}
                        />
                        {errors.start_date && (
							<FormFeedback className="d-block">
								{t(errors.start_date.message)}
							</FormFeedback>
						)}
                    </Col>
                    <Col md={6}>
                        <Label for="end_date">Дуусах хугацаа</Label>
                        <Controller
                            name="end_date"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    type="datetime-local"
                                    invalid={errors?.end_date && true}
                                />
                            )}
                        />
                        {errors.end_date && (
							<FormFeedback className="d-block">
								{t(errors.end_date.message)}
							</FormFeedback>
						)}
                    </Col>
                    <FormGroup>
                        <Label for="file">Файл сонгох</Label>
                        <Input
                            id="file"
                            type="file"
                            bsSize="sm"
                            onChange={onChangeFile}
                            multiple
                        />
                    </FormGroup>
                    <Col>
                        {featurefile.map((file, index) => (
                            <div key={index}>
                                {file.file.name}
                                <X
                                    className="ms-50"
                                    role="button"
                                    color="red"
                                    size={15}
                                    onClick={() => {
                                        const updatedFiles = featurefile.filter((_, i) => i !== index);
                                        setFeaturefile(updatedFiles);
                                    }}
                                />
                            </div>
                        ))}
                    </Col>
                    {errors.file && (
                        <FormFeedback className="d-block">
                            {t(errors.file.message)}
                        </FormFeedback>
                    )}
                </Row>
            </ModalBody>
            <ModalFooter>
                <Button type="submit" color="primary">
                    Хадгалах
                </Button>
            </ModalFooter>
        </Form>
    );
}

export default ReceviedHomeWorks;

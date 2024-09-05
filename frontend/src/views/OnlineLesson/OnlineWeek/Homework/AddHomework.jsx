import { AuthContext } from "@src/utility/context/AuthContext";
import useApi from "@src/utility/hooks/useApi";
import useLoader from "@src/utility/hooks/useLoader";
import useToast from "@src/utility/hooks/useToast";
import { useContext, useEffect, useState } from "react";
import { X } from "react-feather";
import { Controller, useForm } from "react-hook-form";
import { Button, Col, Form, FormFeedback, Input, Label, ModalBody, ModalFooter, Row } from "reactstrap";

import { t } from 'i18next';


function AddHomework({ toggle='', item, refresh }) {
	const addToast = useToast()
	const { userDetail: user } = useContext(AuthContext)

	const homeworkAPI = useApi().homework;

	const [featurefile, setFeaturefile] = useState([]);
	const [datas, setDatas] = useState({})

	const {
		control,
		formState: { errors },
		handleSubmit,
		setValue,
		reset,
		setError,
	} = useForm({
		defaultValues: {
			created_user: user.id,
		},
	});

	const { fetchData: fetchData } = useLoader({});

	const onChangeFile = (e) => {
		const files = Array.from(e.target.files);
		setFeaturefile(files.map(file => ({ file })));
		setValue('changeFile', true)
	};

	async function getOneDatas() {
		if(item?.homework) {
			const { success, data } = await fetchData(homeworkAPI.getOne(item?.homework))
			if(success) {
				for(var key in data) {
					setDatas(data)
					if(key !== 'key') {
						setValue(key, data[key])
					}
					setValue('changeFile', false)
				}
			}
		}
	}

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
			const { success, errors } = await fetchData(homeworkAPI.put(formData, item?.homework))
			if(success) {
				reset();
				toggle && toggle();
				refresh()
			} else {
				/** Алдааны мессэжийг input дээр харуулна */
				for (let key in errors) {
					setError(key, { type: 'custom', message:  errors[key][0]});
				}
			}
		} else {
			const { success, errors } = await fetchData(homeworkAPI.post(formData))
			if(success) {
				reset();
				toggle && toggle();
				refresh()
			} else {
				/** Алдааны мессэжийг input дээр харуулна */
				for (let key in errors) {
					setError(key, { type: 'custom', message:  errors[key][0]});
				}
			}
		}
	}

	const calculateFutureDate = (weeks) => {
		const date = new Date();
		date.setDate(date.getDate() + weeks * 7);
		return date.toISOString().split(".")[0];
	};

	useEffect(() => {
		getOneDatas()
		setFeaturefile([]);
		setValue('start_date', calculateFutureDate(0))
		setValue('end_date', calculateFutureDate(1))
	}, [])
	return (
		<Form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
			<ModalBody className="row margin_fix">
				<Row className="col-xs-6">
					<Col md={6}>
						<Label for="score">Дүгнэх оноо</Label>
						<Controller
							name="score"
							control={control}
							render={({ field }) => (
								<Input {...field} type="text" />
							)}
						/>
						{errors.score && <FormFeedback className='d-block'>{t(errors.score.message)}</FormFeedback>}
					</Col>
					<Col md={6}>
						<Label for="description">Тайлбар</Label>
						<Controller
							name="description"
							control={control}
							render={({ field }) => <Input {...field} type="textarea" />}
						/>
						{errors.description && <FormFeedback className='d-block'>{t(errors.description.message)}</FormFeedback>}
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
								/>
							)}
						/>
						{errors.start_date && <FormFeedback className='d-block'>{t(errors.start_date.message)}</FormFeedback>}
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
								/>
							)}
						/>
						{errors.end_date && <FormFeedback className='d-block'>{t(errors.end_date.message)}</FormFeedback>}
					</Col>
					<Col md={12}>
						<Label for="file">Файл сонгох</Label>
						<Input
							id="file"
							type="file"
							bsSize="sm"
							onChange={onChangeFile}
						/>
						{errors.file && <FormFeedback className='d-block'>{t(errors.file.message)}</FormFeedback>}
					</Col>
					<Col>
						{
							featurefile && featurefile?.length > 0
							?
								featurefile.map((file, index) => (
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
								))
							:
								datas?.file
								?
									<a
										href={datas?.file}
										className="me-2 text-primary text-decoration-underline"
										target={"_blank"}
									>
										{datas?.file.toString().split("/").pop()}
									</a>
								:
									<></>
						}
					</Col>
				</Row>
			</ModalBody>
			<ModalFooter>
				<Button type="submit" color="primary">
					{item?.id ? 'Засах' : 'Хадгалах'}
				</Button>
			</ModalFooter>
		</Form>
	);
}

export default AddHomework;
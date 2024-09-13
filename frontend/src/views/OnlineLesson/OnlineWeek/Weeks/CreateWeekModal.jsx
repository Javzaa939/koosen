
import { t } from "i18next";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import {
	Col,
	Row,
	Form,
	Input,
	Label,
	Button,
	ModalBody,
	ModalFooter,
	FormFeedback,
} from "reactstrap";

import AddHomework from "../Homework/AddHomework";

function CreateWeekModal({ toggle, lesson, isFresh, setIsFresh, editId='' }) {
	const [beforeWeeks, setBeforeWeeks] = useState([])
	const [homeworkModal, setHomeWorkModal] = useState(false);

	const homeworktoggle = () => setHomeWorkModal(!homeworkModal);

	const onlineWeekAPI = useApi().online_week;

	const {
		control,
		formState: { errors },
		handleSubmit,
		setValue,
		reset,
		watch,
		setError,
	} = useForm();

	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});
	const { isLoading, fetchData } = useLoader({});

	const calculateFutureDate = (weeks) => {
		const date = new Date();
		date.setDate(date.getDate() + weeks * 7);
		return date.toISOString().split(".")[0];
	};

	async function onSubmit(cdata) {
		cdata['is_lock'] = cdata?.before_week ? true : false
		cdata['online_lesson'] = lesson.id
		if(editId) {
			const { success, errors } = await postFetch(onlineWeekAPI.put(editId, cdata))
			if(success) {
				setIsFresh(!isFresh)
				reset();
				toggle();
			} else {
				for (let key in errors) {
					setError(key, { type: "custom", message: errors[key][0] });
				}
			}
		} else {
			const { success, errors } = await postFetch(onlineWeekAPI.post(cdata))
			if(success) {
				setIsFresh(!isFresh)
				reset();
				toggle();
			} else {
				for (let key in errors) {
					setError(key, { type: "custom", message: errors[key][0] });
				}
			}
		}
	}

	async function getOtherWeeks() {
		const week_number = watch('week_number')
		if(week_number) {
			const { success, data } = await fetchData(onlineWeekAPI.get(lesson?.id, week_number))
			if(success) {
				setBeforeWeeks(data)
			}
		}
	}

	async function getOneDatas() {
		const { success, data } = await fetchData(onlineWeekAPI.getOne(editId))
		if(success) {
			if (Object.keys(data).length > 0) {
				if(data === null) return
				for(let key in data) {
					if(data[key] !== null) {
						setValue(key, data[key])
					}
				}
			}
		}
	}

	useEffect(() => {
		if(editId) {
			getOneDatas()
		}
	}, [editId])

	useEffect(() => {
		getOtherWeeks()
		const week_number = watch('week_number')
		if(week_number && !editId) {
			setValue('start_date', calculateFutureDate(week_number))
			setValue('end_date', calculateFutureDate(week_number))
		}
	}, [watch('week_number')])

	useEffect(() => {
		if(!editId) {
			// Зөвхөн нэмэх үед анхны утга оноо нь
			setValue('start_date', calculateFutureDate(0))
			setValue('end_date', calculateFutureDate(16))
		}
	}, [editId])

	return (
		<Form onSubmit={handleSubmit(onSubmit)}>
			<ModalBody>
				<Row className="col-xs-6 gy-1">
					<Col md={6}>
						<Label for="week_number">7 хоногийн дугаар</Label>
						<Controller
							name="week_number"
							control={control}
							rules={{ required: "хоногийн дугаар шаардлагатай" }}
							render={({ field }) => (
								<Input
									{...field}
									type="number"
									invalid={errors.week_number && true}
								/>
							)}
						/>
						{errors.week_number && (
							<FormFeedback className="d-block">
								{t(errors.week_number.message)}
							</FormFeedback>
						)}
					</Col>
					<Col md={6}>
						<Label for="before_week">Хамаарах өмнөх хичээл</Label>
						<Controller
							name="before_week"
							control={control}
							defaultValue=''
							render={({ field }) => {
								return (
									<Input {...field} type="select" invalid={errors.before_week && true}>
										<option value=''>--- Сонгоно уу ---</option>
										{
											beforeWeeks?.map((week) => {
												return (
													<option value={week?.id}>{week.week_number}</option>
												)
											})
										}
									</Input>
								)
							}}
						></Controller>
						{errors.before_week && (
							<FormFeedback className="d-block">
								{t(errors.before_week.message)}
							</FormFeedback>
						)}
					</Col>
					<Col md={6}>
						<Label for="start_date">Тухайн хичээлийн эхлэх хугацаа</Label>
						<Controller
							name="start_date"
							control={control}
							rules={{ required: "Эхлэх хугацаа шаардлагатай" }}
							render={({ field }) => (
								<Input {...field} type="datetime-local" invalid={errors.start_date && true} />
							)}
						/>
						{errors.start_date && (
							<FormFeedback className="d-block">
								{t(errors.start_date.message)}
							</FormFeedback>
						)}
					</Col>
					<Col md={6}>
						<Label for="end_date">Тухайн хичээлийн дуусах хугацаа</Label>
						<Controller
							name="end_date"
							control={control}
							rules={{ required: "Дуусах хугацаа шаардлагатай" }}
							render={({ field }) => (
								<Input
									{...field}
									type="datetime-local"
									invalid={errors.end_date && true}
								/>
							)}
						/>
						{errors.end_date && (
							<FormFeedback className="d-block">
								{t(errors.end_date.message)}
							</FormFeedback>
						)}
					</Col>
					<Col md={6}>
						<Label for="challenge_check_score">Шалгалтаар тооцох оноо</Label>
						<Controller
							name="challenge_check_score"
							control={control}
							rules={{ required: "Шалгалтаар тооцох оноо шаардлагатай" }}
							render={({ field }) => <Input {...field} type="number" invalid={errors.challenge_check_score && true} />}
						/>
						{errors.challenge_check_score && (
							<FormFeedback className="d-block">
								{t(errors.challenge_check_score.message)}
							</FormFeedback>
						)}
					</Col>
				</Row>
			</ModalBody>
			<ModalFooter>
				<Button type="submit" color="primary">
					Хадгалах
				</Button>
			</ModalFooter>
			{
				homeworkModal &&
				<AddHomework toggle={homeworktoggle} />
			}
		</Form>
	);
}

export default CreateWeekModal;
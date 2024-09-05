import useApi from "@src/utility/hooks/useApi";
import useLoader from "@src/utility/hooks/useLoader";
import { convertDefaultValue } from '@src/utility/Utils';
import { ReactSelectStyles } from '@utils';
import classnames from "classnames";
import { Fragment, useContext, useEffect, useState, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Select from 'react-select';
import {
	Button,
	Col,
	Form,
	FormFeedback,
	Input,
	Label,
	Modal,
	ModalBody,
	ModalFooter,
	ModalHeader,
	Row,
} from "reactstrap";

import ReactQuill from 'react-quill';
import AuthContext from "@src/utility/context/AuthContext";
import 'react-quill/dist/quill.snow.css';

const modules = {
    toolbar: [
        [{ 'font': [] }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'script': 'sub' }, { 'script': 'super' }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean']
    ]
};

const formats = [
    'font', 'header', 'size', 'color', 'background', 'align',
    'bold', 'italic', 'underline', 'strike', 'script',
    'list', 'bullet', 'indent', 'blockquote', 'code-block',
    'link', 'image', 'video'
];

function AddLessonForm({ open, toggle, getLessons }) {
	// state
	const [lesson, setLesson] = useState([])
	const [groups, setGroups ] = useState([])

    // onSubmit state
	const [description, setDescription] = useState('');

	//API
	const editorRef = useRef(null);
	const onlineLessonAPI = useApi().online_lesson;
    const lessonApi = useApi().lesson_list
	const groupAPI =  useApi().get_group;

	const { userDetail } = useContext(AuthContext)
	const user = userDetail;

	const {
		control,
		formState: { errors },
		handleSubmit,
		setValue,
		reset,
	} = useForm({
		defaultValues: {
			total_score: 100,
			create_type: '',
			is_end_exam: true
		},
	});

	// hooks
	const { fetchData } = useLoader({ isFullScreen: true })
	const { t } = useTranslation();

	// Хичээлийн жагсаалт
	async function getLessonOption() {
		const { success, data } = await fetchData(lessonApi.get(userDetail.id));
		if (success) {
			setLesson(data);
		}
	}

	async function getGroupList() {
		const {success, data} = await fetchData(groupAPI.get())
		if(success) {
			setGroups(data)
		}
	}

	async function onSubmit(cdata) {
		cdata.plan = description;
		cdata = convertDefaultValue(cdata);
		const { success, data } = await fetchData(onlineLessonAPI.lessonRegister(cdata));
		if (success) {
			reset();
			toggle();
			getLessons
		}
	}

	useEffect(() => {
		getLessonOption();
		getGroupList()
	}, [])

	useEffect(() => {
		if (user) {
			setValue("teacher", user.id);
		}
	}, [user, setValue]);

	return (
		<Fragment>
			<Modal toggle={toggle} isOpen={open} className="modal-dialog-centered modal-lg">
				<ModalHeader
					toggle={toggle}
					tag="div"
				>
					<h5 className="modal-title">{t('Цахим хичээл нэмэх')}</h5>
				</ModalHeader>
				<ModalBody className="row margin_fix">
					<Form onSubmit={handleSubmit(onSubmit)}>
						<Row tag="div">
							<Col md={6}>
								<Label for="lesson">Хичээл</Label>
								<Controller
									name="lesson"
									control={control}
									defaultValue={[]}
									render={({ field: { value, onChange } }) => {
									return (
										<Select
										name="lesson"
										id="lesson"
										classNamePrefix="select"
										isClearable
										className={classnames('react-select', { 'is-invalid': errors.lesson })}
										placeholder={`-- Сонгоно уу --`}
										options={lesson || []}
										value={lesson.find((item) => item.id === value) || null}
										noOptionsMessage={() => 'Хоосон байна'}
										onChange={(val) => {
											onChange(val?.id || '')
										}}
										styles={ReactSelectStyles}
										getOptionValue={(option) => option.id}
										getOptionLabel={(option) => option.name + ' (' + option.code + ')'}
										/>
									)}}
								/>
								{errors.lesson && (
									<FormFeedback className="d-block">
									{t(errors.lesson.message)}
									</FormFeedback>
								)}
								</Col>
							<Col md={6}>
								<Label for="total_score">Нийт үнэлэх оноо</Label>
								<Controller
									name="total_score"
									defaultValue=''
									control={control}
									render={({ field }) => (
										<Input {...field} type="number" id='total_score' invalid={errors.total_score && true} bsSize='sm'/>
									)}
								/>
								{errors.total_score && (
									<FormFeedback className="d-block">
										{t(errors.total_score.message)}
									</FormFeedback>
								)}
							</Col>
							<Col md={6}>
								<Label for="group">Анги дамжаа</Label>
								<Controller
									name="group"
									control={control}
									defaultValue={[]}
									render={({ field: { value, onChange } }) => {
									return (
										<Select
											name="group"
											id="group"
											classNamePrefix="select"
											isClearable
											isMulti
											className={classnames('react-select', { 'is-invalid': errors.lesson })}
											placeholder={`-- Сонгоно уу --`}
											options={groups || []}
											value={groups.filter((c) => value.includes(c.id))}
											noOptionsMessage={() => 'Хоосон байна'}
											onChange={(selectedOptions) => {
												onChange(selectedOptions.map(option => option.id))
											}}
											styles={ReactSelectStyles}
											getOptionValue={(option) => option.id}
											getOptionLabel={(option) => option.name + ' (' + option?.profession_name + ')'}
										/>
									);
									}}
								/>
								{errors.lesson && (
									<FormFeedback className="d-block">
									{t(errors.lesson.message)}
									</FormFeedback>
								)}
							</Col>
							<Col md={12} xs={12} className='mt-1'>
								<Label style={{ fontSize: '15px', fontWeight: 'bold' }}>
									Хичээлийн танилцуулга
								</Label>
								<ReactQuill
									ref={editorRef}
									theme="snow"
									value={description}
									onChange={setDescription}
									modules={modules}
									formats={formats}
									style={{
									}}
									placeholder="Хичээлийн танилцуулга талаар дэлгэрэнгүй мэдээллүүд..."
								/>
							</Col>
						</Row>
						<ModalFooter>
							<Button color="primary" type="submit">
								{t('Хадгалах')}
							</Button>
							<Button color="secondary" onClick={toggle}>
								{t('Болих')}
							</Button>
						</ModalFooter>
					</Form>
				</ModalBody>
			</Modal>
		</Fragment>
	)
}

export default AddLessonForm
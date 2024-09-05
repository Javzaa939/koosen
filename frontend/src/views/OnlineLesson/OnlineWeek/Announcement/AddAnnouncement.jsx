import { useContext, useEffect, useState , useRef} from "react";
import { ReactSelectStyles } from '@utils';
import useApi from "@src/utility/hooks/useApi";
import useLoader from "@src/utility/hooks/useLoader";
import { Controller, useForm } from "react-hook-form";
import Select from 'react-select';
import classnames from "classnames";
import { Button, Card, CardBody, Col, Form, FormFeedback, Input, Label, ModalBody, ModalFooter, Row } from "reactstrap";

import AuthContext from "@src/utility/context/AuthContext";
import ReactQuill from 'react-quill';

import 'react-quill/dist/quill.snow.css';
import { useParams } from "react-router-dom";


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


function AddAnnouncementModal({ toggle, lesson, editData, refreshDatas}) {
	const { index } = useParams()
    const { fetchData: postFetch } = useLoader({});

    const { userDetail } = useContext(AuthContext);
	const [weeks, setWeeks] = useState([]);
	const [description, setDescription] = useState('');

	// API
    const announcementAPI = useApi().announcement;
	const onlineWeek = useApi().online_week

	const editorRef = useRef(null);

    const {
		control,
		formState: { errors },
		handleSubmit,
		reset,
		setValue,
    } = useForm({
		defaultValues: {
			online_lesson: lesson?.id,
			created_user: userDetail?.id,
		},
    })

	const getWeeks = async () => {
		  const { success, data } = await onlineWeek.get(index);
		  if(success){
			setWeeks(data);
		  }
	};

    useEffect(() => {
		if (editData) {
			setDescription(editData.body);
			Object.keys(editData).forEach(key => {
				setValue(key, editData[key]);
			});
		}
    }, [editData, setValue]);

	useEffect(() => {
		getWeeks()
	}, [])

    async function onSubmit(cdata) {
		cdata.body = description
		cdata['online_lesson'] = index
		try {
			if (editData && editData.id) {
				const { success } = await postFetch(announcementAPI.put(editData.id, cdata));
			} else {
				const { success } = await postFetch(announcementAPI.post(cdata));
			}
			refreshDatas()
			reset();
			toggle();
		} catch (err) {
			console.error("Unexpected error:", err);
		}
    }

    return (
      <Form onSubmit={handleSubmit(onSubmit)}>
			<ModalBody className="row margin_fix w-100">
			<Row className="col-xs-6">
				<Col md={6}>
				<Label for="title">Зарлал гарчиг</Label>
				<Controller
					name="title"
					control={control}
					render={({ field }) => (
						<Input
							{...field}
							type="textarea"
							bsSize='sm'
							placeholder='Зарлал гарчиг'
						/>
					)}
				/>
				</Col>
				<Col md={6}>
					<Label for="week">7хоног</Label>
					<Controller
						name="week"
						control={control}
						defaultValue={[]}
						render={({ field: { value, onChange } }) => {
						return (
							<Select
								name="week"
								id="week"
								classNamePrefix="select"
								isClearable
								className={classnames('react-select')}
								placeholder={`-- Сонгоно уу --`}
								options={weeks || []}
								value={weeks.find((item) => item.id === value) || null}
								noOptionsMessage={() => 'Хоосон байна'}
								onChange={(val) => {
									onChange(val?.id || '')
								}}
								styles={ReactSelectStyles}
								getOptionValue={(option) => option.id}
								getOptionLabel={(option) => option.week_number}
							/>
						);
						}}
					/>
				</Col>
				<Col md={12} xs={12} className='mt-50'>
					<Card style={{ height: '100%', }}>
						<CardBody>
							<Label style={{ fontSize: '15px', fontWeight: 'bold' }}>
								Хичээлийн зарлал
							</Label>
							<ReactQuill
								ref={editorRef}
								theme="snow"
								value={description}
								onChange={setDescription}
								modules={modules}
								formats={formats}
								placeholder="Зарлалын талаар дэлгэрэнгүй мэдээллүүд..."
							/>
						</CardBody>
					</Card>
				</Col>
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

export default AddAnnouncementModal;

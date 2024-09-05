import React, { useState, useRef } from 'react'
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap'
import ReactQuill from 'react-quill';

import useApi from "@hooks/useApi";
import useLoader from '@hooks/useLoader';
import useModal from '@hooks/useModal';

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

function Plan({ lesson, getLesson}) {
	const [modal, setModal] = useState(false)
	const [plan, setPlan] = useState('');
	const editorRef = useRef(null);
    const text = lesson?.plan
    const { showWarning } = useModal();

	const planApi = useApi().online_lesson
	const { fetchData } = useLoader({})

	const handleDelete = async() => {
        const { success, data } = await fetchData(planApi.deletePlan(lesson?.id));
        if (success) {
            getLesson()
        }
    }

	const handleModal = () => {
		setModal(!modal)
	}

	const handleSubmit = async() => {
        const { success, data } = await fetchData(planApi.postPlan(lesson?.id, plan));
        if (success) {
            getLesson()
			handleModal()
        }
    }

	return (
		<div className='p-2'>
			<div className="text-end mb-1">
				<Button
					size='sm'
					color='primary'
					onClick={() => handleModal()}
					className="ms-1"
				>
					Нэмэх
				</Button>
				<Button
					size='sm'
					color='danger'
					onClick={() => showWarning({
						header: {
							title: 'Устгах үйлдэл',
						},
						question: 'Та энэхүү сургалтын төлөвлөгөөг устгахдаа итгэлтэй байна уу?',
						onClick: () => handleDelete(),
						btnText: 'Устгах',
					})}
					className="ms-1"
				>
					Устгах
				</Button>
			</div>
			<hr/>
			<div style={{maxHeight: '400px', overflowY: 'auto'}}>
				<div className={`width-auto  p-2`} id="announcements" dangerouslySetInnerHTML={{ __html: text }} ></div>
			</div>
			<Modal
				className="modal-dialog-centered modal-lg"
				contentClassName="pt-0"
				backdrop="static"
				isOpen={modal}
				toggle={handleModal}
			>
				<ModalHeader toggle={handleModal}>Хичээлийн танилцуулга оруулах</ModalHeader>
				<ModalBody>
					<ReactQuill
						ref={editorRef}
						theme="snow"
						value={plan}
						onChange={setPlan}
						modules={modules}
						formats={formats}
						placeholder="Хичээлийн танилцуулга талаар дэлгэрэнгүй мэдээллүүд..."
					/>
				</ModalBody>
				<div className='m-1'>
					<Button color='primary' onClick={() => handleSubmit()}>Хадгалах</Button>
				</div>
			</Modal>
		</div>
	)
}

export default Plan

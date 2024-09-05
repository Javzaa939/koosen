import useApi from "@src/utility/hooks/useApi";
import { useState } from "react";
import { Col, Modal, ModalHeader, Row, Button } from "reactstrap";
import AddHomework from "./AddHomework";
import { Trash } from "react-feather";
import ReceviedHomeWorks from "./ReceviedHomeWorks";
import HomeWorkContainer from "./HomeWorkContainer";

function HomeWork({ item, deleteHomeWork, refresh }) {
	const [modal, setModal] = useState(false);
	const [resModal, setResModal] = useState(false);

	const toggle = () => setModal(!modal);
	const toggle2 = () => setResModal(!resModal);

	function truncateText(text, maxLength) {
		if (typeof text !== 'string') {
			return '';
		}
		if (text.length <= maxLength) {
			return text;
		}
		return text.substring(0, maxLength) + '...';
	}

	const onlineHomeworkAPI = useApi().homework;

	async function deleteHomeWork(id){
		try{
			const response = await onlineHomeworkAPI.delete(id);
		}catch(err){
			console.log(err)
		}
	}

	const maxLength = 100

	const handleUrl = (url) => {
		if(url) {
			const lastIndexOfUrl = url.lastIndexOf('/') + 1;
			return url.substring(lastIndexOfUrl, url.length);
		}
	}

	const formatDate = (isoDateString) => {
		if (!isoDateString) return '';

		const date = new Date(isoDateString);
		const year = date.getFullYear();
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const day = date.getDate().toString().padStart(2, '0');

		return `${year}-${month}-${day}`;
	};

	return (
		<div className="w-100">
			<div className="d-flex flex-row justify-content-between align-items-center">
				<div className="w-100 d-flex justify-content-between align-items-center">
					<div className="cursor-pointer mb-1 text-center" >
						<h4 variant="outlined">Гэрийн даалгавар </h4>
						<div>{truncateText(item?.homework?.description, maxLength)}</div>
					</div>
					<Button size='sm' color="primary" onClick={toggle}>
						{
							item?.homework
							?
								'Үзэх'
							:
								'Оруулах'
						}
					</Button>
				</div>
			</div>
			{
				modal &&
				<Modal
					className="modal-dialog-centered modal-lg"
					contentClassName="pt-0"
					backdrop="static"
					isOpen={modal}
					toggle={toggle}
				>
					<ModalHeader toggle={toggle}>
						Гэрийн даалгавар оруулах
					</ModalHeader>
					<AddHomework toggle={toggle} item={item} refresh={refresh} />
				</Modal>
			}
			{/* <HomeWorkContainer data={item}/> */}
			{/* {
				!item?.homework
				?
					(
						<>
							<div className="d-flex flex-row justify-content-between align-items-center">
								<div className="w-100 d-flex justify-content-between align-items-center">
									<div className="cursor-pointer mb-1 text-center" >
										<h4 variant="outlined">Гэрийн даалгавар </h4>
										<div>{truncateText(item?.homework?.description, maxLength)}</div>
									</div>
									<Button variant="contained" color="success" onClick={toggle}>
										Оруулах
									</Button>
								</div>
							</div>
							<Modal
								className="modal-dialog-centered modal-lg"
								contentClassName="pt-0"
								backdrop="static"
								isOpen={modal}
								toggle={toggle}
							>
								<ModalHeader toggle={toggle}>
									Гэрийн даалгавар оруулах
								</ModalHeader>
								<AddHomework toggle={toggle} item={item} />
							</Modal>
						</>
					)
				:
					(
						<div className="d-flex flex-row justify-content-between align-items-center">
							<Row className="w-100">
								<Col xl={2} lg={2} md={2} sm={12} className="cursor-pointer mb-1" >
									<h4 variant="outlined">Гэрийн даалгавар </h4>
									{formatDate(item?.homework?.start_date)}
								</Col>
								<Col xl={6} lg={6} md={6} sm={12} className="cursor-pointer mb-1" >
										<a href={item?.homework?.file} download className="color-primary">
											{handleUrl(item?.homework?.file)}
										</a>
								</Col>
								<Col xl={2} lg={2} md={2}  sm={12} className="cursor-pointer mb-1" >
									<Button onClick={() => toggle2()} my={1} style={{ width: '100%' }} variant="contained">
										Гэрийн даалгавар шалгах
									</Button>
								</Col>
								<Col xl={1} lg={1} md={1} sm={12} className="cursor-pointer mb-1" >
									<Button my={1} style={{ width: '100%' }} variant="contained">
										Засах
									</Button>
								</Col>
								<Col xl={1} lg={1} md={1}  sm={12} className="cursor-pointer mb-1" >
									<Button
										my={1}
										onClick={() => deleteHomeWork(item?.homework?.id)}
										style={{ width: '100%' }}
										variant="contained"
										color="error"
									>
										Устгах <Trash id={`questionDelete`} className=' cursor-pointer' />
									</Button>
								</Col>
							</Row>
						</div>
					)
			}
			<Modal
				className="modal-dialog-centered modal-lg"
				contentClassName="pt-0"
				backdrop="static"
				isOpen={modal}
				toggle={toggle}
			>
				<ModalHeader toggle={toggle}>
					Гэрийн даалгавар оруулах
				</ModalHeader>
				<ReceviedHomeWorks toggle={toggle} item={item} />
			</Modal> */}
		</div>
	);
}

export default HomeWork;

import React from "react";
import {
	Button,
	Col,
	Label,
	Modal,
	ModalBody,
	ModalHeader,
} from "reactstrap";
import useLoader from "@hooks/useLoader";

function OrderModal({
	gpaModalHandler,
	gpaModal,
	data,
	gplesson_year,
	profession_name,
}) {
	//Loader
	const { Loader, isLoading } = useLoader({
		isFullScreen: true,
		bg: 1,
	});

	return (
		<Modal centered toggle={gpaModalHandler} isOpen={gpaModal} size="sm">
			{isLoading && Loader}
			<ModalHeader toggle={gpaModalHandler}>
				<h5>Элсэгчдийн ЭЕШ оноо татах</h5>
			</ModalHeader>

			<ModalBody className="d-flex flex-column">
				<div className="d-flex justify-content-between gap-4 fw-bolder border-bottom mb-1">
					<p>{gplesson_year}</p>
					<p>{profession_name}</p>
				</div>
				<Col md={12}>
					<div className="modal-content-container">
						<div className="d-flex justify-content-between">
							<Label className="d-flex">Нийт:&nbsp;<strong>{data.total_count}</strong>&nbsp;сурагч</Label>
						</div>
					</div>
				</Col>
				<div className="d-flex justify-content-between mt-1 align-items-center">
					<div className="d-flex flex-column">
						<p className="d-flex mb-2">Монгол хэл бичгийн шалгалтанд </p>
						<p className="d-flex">Тэнцсэн элсэгч:&nbsp; <strong>{data.passed_student_count}</strong></p>
						<p className="d-flex">Тэнцээгүй элсэгч:&nbsp; <strong>{data.failed_student_count}</strong></p>
					</div>
				</div>
				<div className="d-flex justify-content-end">
					<div className="my-50">
						<Button className="m-50" onClick={gpaModalHandler}>
							Буцах
						</Button>
					</div>
				</div>
			</ModalBody>
		</Modal>
	);
}

export default OrderModal;

import DataTable from "react-data-table-component";
import { Plus, Search } from "react-feather";

import {
	Button,
	Card,
	CardBody,
	CardHeader,
	CardTitle,
	Col,
	Input,
	Row
} from "reactstrap";

import { getPagination } from "@utils";
import getColumns from "../../hooks/getColumns";
import React from "react";

export default function OnlineInfoBlock({
	t,
	datas,
	getDatas,
	isLoading,
	fetchData,
	remoteApi,
	elearnId
}) {
	// console.log(datas, 'eeeeeeeeeeeeeee')

	async function handleDelete(id) {
		// const { success } = await fetchData(remoteApi.students.delete(elearnId, id));

		// if (success) {
		// 	getDatas();
		// }
	}

	async function handleModal(id) {
		// const { success } = await fetchData(remoteApi.students.delete(elearnId, id));

		// if (success) {
		// 	getDatas();
		// }
	}

	return (
		<Card md={12} className='bg-white'>
			<CardHeader className="border-bottom">
				<Row className="">
					<Col>
						<CardTitle tag="h4">{t("Тухайн цахим хичээлд хамаарах бүлгүүд")}</CardTitle>
					</Col>
					<Col className="d-flex flex-column align-items-end">
						<Button color='primary' onClick={handleModal}
							className="rounded-circle d-flex align-items-center justify-content-center p-0"
							style={{ width: '30px', height: '30px' }}
						>
							<Plus size={15} />
						</Button>
					</Col>
				</Row>
			</CardHeader>
			<CardBody>
				<div className="accordion stick-top accordion-custom-button course-content-fixed" id="courseContent">
					<div className="accordion-item mb-0">
						<div className="accordion-header" id="headingOne">
							<button type="button" className="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#chapterOne" aria-expanded="false" aria-controls="chapterOne">
								<span className="d-flex flex-column">
									<span className="h5 mb-0">Course Content</span>
									<span className="text-body fw-normal">2 / 5 | 4.4 min</span>
								</span>
							</button>
						</div>
						<div id="chapterOne" className="accordion-collapse collapse" data-bs-parent="#courseContent">
							<div className="accordion-body py-4">
								<div className="form-check d-flex align-items-center gap-1 mb-4">
									<span className="mb-0 h6">1. Welcome to this course</span>
									<small className="text-body d-block">2.4 min</small>
								</div>
								<div className="form-check d-flex align-items-center gap-1 mb-4">
									<span className="mb-0 h6">2. Watch before you start</span>
									<small className="text-body d-block">4.8 min</small>
								</div>
								<div className="form-check d-flex align-items-center gap-1 mb-4">
									<span className="mb-0 h6">3. Basic design theory</span>
									<small className="text-body d-block">5.9 min</small>
								</div>
								<div className="form-check d-flex align-items-center gap-1 mb-4">
									<span className="mb-0 h6">4. Basic fundamentals</span>
									<small className="text-body d-block">3.6 min</small>
								</div>
								<div className="form-check d-flex align-items-center gap-1 mb-0">
									<span className="mb-0 h6">5. What is ui/ux</span>
									<small className="text-body d-block">10.6 min</small>
								</div>
							</div>
						</div>
					</div>
				</div>
			</CardBody>
		</Card>
	)
}
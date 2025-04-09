import DataTable from "react-data-table-component";
import { Search } from "react-feather";

import {
	Button,
	Card,
	CardBody,
	CardHeader,
	CardTitle,
	Col,
	Input
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

	async function handleDelete(id) {
		// const { success } = await fetchData(remoteApi.students.delete(elearnId, id));

		// if (success) {
		// 	getDatas();
		// }
	}

	return (
		<Card md={12} className='bg-white'>
			<CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
				<CardTitle tag="h4">{t("Тухайн цахим хичээлд хамаарах бүлгүүд")}</CardTitle>
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
							<input className="form-check-input" type="checkbox" id="defaultCheck1" checked="" />
							<label htmlFor="defaultCheck1" className="form-check-label ms-4">
							<span className="mb-0 h6">1. Welcome to this course</span>
							<small className="text-body d-block">2.4 min</small>
							</label>
						</div>
						<div className="form-check d-flex align-items-center gap-1 mb-4">
							<input className="form-check-input" type="checkbox" id="defaultCheck2" checked="" />
							<label htmlFor="defaultCheck2" className="form-check-label ms-4">
							<span className="mb-0 h6">2. Watch before you start</span>
							<small className="text-body d-block">4.8 min</small>
							</label>
						</div>
						<div className="form-check d-flex align-items-center gap-1 mb-4">
							<input className="form-check-input" type="checkbox" id="defaultCheck3" />
							<label htmlFor="defaultCheck3" className="form-check-label ms-4">
							<span className="mb-0 h6">3. Basic design theory</span>
							<small className="text-body d-block">5.9 min</small>
							</label>
						</div>
						<div className="form-check d-flex align-items-center gap-1 mb-4">
							<input className="form-check-input" type="checkbox" id="defaultCheck4" />
							<label htmlFor="defaultCheck4" className="form-check-label ms-4">
							<span className="mb-0 h6">4. Basic fundamentals</span>
							<small className="text-body d-block">3.6 min</small>
							</label>
						</div>
						<div className="form-check d-flex align-items-center gap-1 mb-0">
							<input className="form-check-input" type="checkbox" id="defaultCheck5" />
							<label htmlFor="defaultCheck5" className="form-check-label ms-4">
							<span className="mb-0 h6">5. What is ui/ux</span>
							<small className="text-body d-block">10.6 min</small>
							</label>
						</div>
						</div>
					</div>
					</div>
					<div className="accordion-item">
					<div className="accordion-header" id="headingTwo">
						<button type="button" className="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#chapterTwo" aria-expanded="false" aria-controls="chapterTwo">
						<span className="d-flex flex-column">
							<span className="h5 mb-0">Web Design for Web Developers</span>
							<span className="text-body fw-normal">1 / 4 | 4.4 min</span>
						</span>
						</button>
					</div>
					<div id="chapterTwo" className="accordion-collapse collapse" data-bs-parent="#courseContent">
						<div className="accordion-body py-4">
						<div className="form-check mb-4">
							<input className="form-check-input mt-3" type="checkbox" id="defCheck1" checked="" />
							<label htmlFor="defCheck1" className="form-check-label ms-4">
							<span className="mb-0 h6">1. How to use Pages in Figma</span>
							<small className="text-body d-block">8:31 min</small>
							</label>
						</div>
						<div className="form-check mb-4">
							<input className="form-check-input mt-3" type="checkbox" id="defCheck2" />
							<label htmlFor="defCheck2" className="form-check-label ms-4">
							<span className="mb-0 h6">2. What is Lo Fi Wireframe</span>
							<small className="text-body d-block">2 min</small>
							</label>
						</div>
						<div className="form-check mb-4">
							<input className="form-check-input mt-3" type="checkbox" id="defCheck3" />
							<label htmlFor="defCheck3" className="form-check-label ms-4">
							<span className="mb-0 h6">3. How to use color in Figma</span>
							<small className="text-body d-block">5.9 min</small>
							</label>
						</div>
						<div className="form-check mb-0">
							<input className="form-check-input mt-3" type="checkbox" id="defCheck4" />
							<label htmlFor="defCheck4" className="form-check-label ms-4">
							<span className="mb-0 h6">4. Frames vs Groups in Figma</span>
							<small className="text-body d-block">3.6 min</small>
							</label>
						</div>
						</div>
					</div>
					</div>
					<div className="accordion-item">
					<div className="accordion-header" id="headingThree">
						<button type="button" className="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#chapterThree" aria-expanded="false" aria-controls="chapterThree">
						<span className="d-flex flex-column">
							<span className="h5 mb-0">Build Beautiful Websites!</span>
							<span className="text-body fw-normal">0 / 6 | 4.4 min</span>
						</span>
						</button>
					</div>
					<div id="chapterThree" className="accordion-collapse collapse" data-bs-parent="#courseContent">
						<div className="accordion-body py-4">
						<div className="form-check mb-4">
							<input className="form-check-input mt-3" type="checkbox" id="defCheck-01" />
							<label htmlFor="defCheck-01" className="form-check-label ms-4">
							<span className="mb-0 h6">1. Section &amp; Div Block</span>
							<small className="text-body d-block">8:31 min</small>
							</label>
						</div>
						<div className="form-check mb-4">
							<input className="form-check-input mt-3" type="checkbox" id="defCheck-02" />
							<label htmlFor="defCheck-02" className="form-check-label ms-4">
							<span className="mb-0 h6">2. Read-Only Version of Chat App</span>
							<small className="text-body d-block">8 min</small>
							</label>
						</div>
						<div className="form-check mb-4">
							<input className="form-check-input mt-3" type="checkbox" id="defCheck-03" />
							<label htmlFor="defCheck-03" className="form-check-label ms-4">
							<span className="mb-0 h6">3. Webflow Autosave</span>
							<small className="text-body d-block">2.9 min</small>
							</label>
						</div>
						<div className="form-check mb-4">
							<input className="form-check-input mt-3" type="checkbox" id="defCheck-04" />
							<label htmlFor="defCheck-04" className="form-check-label ms-4">
							<span className="mb-0 h6">4. Canvas Settings</span>
							<small className="text-body d-block">7.6 min</small>
							</label>
						</div>
						<div className="form-check mb-4">
							<input className="form-check-input mt-3" type="checkbox" id="defCheck-05" />
							<label htmlFor="defCheck-05" className="form-check-label ms-4">
							<span className="mb-0 h6">5. HTML Tags</span>
							<small className="text-body d-block">10 min</small>
							</label>
						</div>
						<div className="form-check mb-0">
							<input className="form-check-input mt-3" type="checkbox" id="defCheck-06" />
							<label htmlFor="defCheck-06" className="form-check-label ms-4">
							<span className="mb-0 h6">6. Footer (Chat App)</span>
							<small className="text-body d-block">9.10 min</small>
							</label>
						</div>
						</div>
					</div>
					</div>
					<div className="accordion-item">
					<div className="accordion-header" id="headingFour">
						<button type="button" className="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#chapterFour" aria-expanded="false" aria-controls="chapterFour">
						<span className="d-flex flex-column">
							<span className="h5 mb-0">Final Project</span>
							<span className="text-body fw-normal">2 / 3 | 4.4 min</span>
						</span>
						</button>
					</div>
					<div id="chapterFour" className="accordion-collapse collapse" data-bs-parent="#courseContent">
						<div className="accordion-body py-4">
						<div className="form-check mb-4">
							<input className="form-check-input mt-3" type="checkbox" id="defCheck-101" checked="" />
							<label htmlFor="defCheck-101" className="form-check-label ms-4">
							<span className="mb-0 h6">1. Responsive Blog Site</span>
							<small className="text-body d-block">10:0 min</small>
							</label>
						</div>
						<div className="form-check mb-4">
							<input className="form-check-input mt-3" type="checkbox" id="defCheck-102" checked="" />
							<label htmlFor="defCheck-102" className="form-check-label ms-4">
							<span className="mb-0 h6">2. Responsive Portfolio</span>
							<small className="text-body d-block">13:00 min</small>
							</label>
						</div>
						<div className="form-check mb-0">
							<input className="form-check-input mt-3" type="checkbox" id="defCheck-103" />
							<label htmlFor="defCheck-103" className="form-check-label ms-4">
							<span className="mb-0 h6">3. Responsive eCommerce Website</span>
							<small className="text-body d-block">15 min</small>
							</label>
						</div>
						</div>
					</div>
					</div>
				</div>
			</CardBody>
		</Card>
	)
}
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

export default function OnlineSubInfoBlock({
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
				<CardTitle tag="h4">
					{t("Цахим хичээлийн хэсэг")}
				</CardTitle>
			</CardHeader>
			<CardBody>
				<div className="card academy-content shadow-none border">
					<div className="card-body pt-4">
						<h5>About this course</h5>
						<p className="mb-0">Learn web design in 1 hour with 25+ simple-to-use rules and guidelines — tons of amazing web design resources included!</p>
						<hr className="my-6" />
						<h5>By the numbers</h5>
						<div className="d-flex flex-wrap row-gap-2">
							<div className="me-12">
								<p className="text-nowrap mb-2"><i className="icon-base ti tabler-check me-2 align-bottom" />Skill level: All Levels</p>
								<p className="text-nowrap mb-2"><i className="icon-base ti tabler-users me-2 align-top" />Students: 38,815</p>
								<p className="text-nowrap mb-2"><i className="icon-base ti tabler-world me-2 align-bottom" />Languages: English</p>
								<p className="text-nowrap mb-0"><i className="icon-base ti tabler-file me-2 align-bottom" />Captions: Yes</p>
							</div>
							<div>
								<p className="text-nowrap mb-2"><i className="icon-base ti tabler-video me-2 align-top ms-50" />Lectures: 19</p>
								<p className="text-nowrap mb-0"><i className="icon-base ti tabler-clock me-2 align-top" />Video: 1.5 total hours</p>
							</div>
						</div>
						<hr className="my-6" />
						<h5>Description</h5>
						<p className="mb-6">The material of this course is also covered in my other course about web design and development with HTML5 &amp; CSS3. Scroll to the bottom of this page to check out that course, too! If you're already taking my other course, you already have all it takes to start designing beautiful websites today!</p>
						<p className="mb-6">"Best web design course: If you're interested in web design, but want more than just a "how to use WordPress" course,I highly recommend this one." — Florian Giusti</p>
						<p>"Very helpful to us left-brained people: I am familiar with HTML, CSS, JQuery, and Twitter Bootstrap, but I needed instruction in web design. This course gave me practical, impactful techniques for making websites more beautiful and engaging." — Susan Darlene Cain</p>
						<hr className="my-6" />
						<h5>Instructor</h5>
						<div className="d-flex justify-content-start align-items-center user-name">
							<div className="avatar-wrapper">
								<div className="avatar me-4"><img src="../../assets/img/avatars/11.png" alt="Avatar" className="rounded-circle" /></div>
							</div>
							<div className="d-flex flex-column">
								<h6 className="mb-1">Devonne Wallbridge</h6>
								<small>Web Developer, Designer, and Teacher</small>
							</div>
						</div>
					</div>
				</div>
			</CardBody>
		</Card >
	)
}
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Col, Input, Label, Row } from "reactstrap";

import { getPagination } from "@src/utility/Utils";

export default function StateCustomPagination({
	limitOptions = [10, 25, 50, 75, 100, 'Бүгд'],
	totalCount = 0,
	setParentStatePage = () => null,
	setParentStateLimit = () => null,
	isUseLimitInput = true,
	refreshDatas,
	current_page: current_page_parent = 1,
	rows_per_page: rows_per_page_parent = limitOptions[2]
}) {
	const [current_page, setCurrentPage] = useState(current_page_parent)
	const [rows_per_page, setRowsPerPage] = useState(rows_per_page_parent)

	const { t } = useTranslation()

	const isFirstRender = useRef(true)

	const handleNamePagination = (page) => {
		const newPage = page.selected + 1
		setCurrentPage(newPage)
		setParentStatePage(newPage)
	}

	function handlePerPage(e) {
		let newLimit = 0

		if (e.target.value === 'Бүгд') newLimit = totalCount
		else newLimit = parseInt(e.target.value)

		setRowsPerPage(newLimit)
		setParentStateLimit(newLimit)
		setParentStatePage(1)
	}

	useEffect(() => {
		if (isFirstRender.current) isFirstRender.current = false
		else refreshDatas()
	}, [current_page, rows_per_page]);

	return (
		<>
			{isUseLimitInput
				?
				<>
					<style>
						{`
							.state-custom-pagination-pageSwitcher > div > label {
								flex-shrink: initial !important;
							}

							[dir=ltr] .state-custom-pagination-pageSwitcher > div > label {
								margin-right: 0 !important;
								margin-left: 0 !important;
							}
						`}
					</style>
					<Row style={{ width: '100%' }}>
						<Col>
							<Label for='sort-select'>{t('Хуудсанд харуулах тоо')}</Label>
						</Col>
						<Col>
							<Input
								type='select'
								bsSize='sm'
								style={{ height: "30px" }}
								value={rows_per_page === totalCount ? 'Бүгд' : rows_per_page}
								onChange={e => handlePerPage(e)}
							>
								{
									limitOptions.map((page, idx) => (
										<option
											key={idx}
											value={page}
										>
											{page}
										</option>
									))
								}
							</Input>
						</Col>
					</Row>
					<Row>
						<Col className="state-custom-pagination-pageSwitcher">
							{getPagination(handleNamePagination, current_page, rows_per_page, totalCount)()}
						</Col>
					</Row>
				</>
				:
				getPagination(handleNamePagination, current_page, rows_per_page, totalCount)()
			}
		</>
	)
}

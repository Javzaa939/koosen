import useLoader from "@src/utility/hooks/useLoader"
import { getPagination } from "@src/utility/Utils"
import { useEffect, useRef, useState } from "react"
import DataTable from "react-data-table-component"
import { ChevronDown } from "react-feather"
import { useTranslation } from "react-i18next"
import { Spinner } from "reactstrap"

export default function GenericDataTable({ apiGetFunc, apiGetFuncArgs, isApiGetFuncArgsDefault, columns, rows_per_page, search_value, render_to_search, conditionalRowStyles={} }) {
	// states
	const [current_page, setCurrentPage] = useState(1)
	const [total_count, setTotalCount] = useState(1)
	const [data, setData] = useState([])
    const [sortField, setSort] = useState('')

	const { isLoading, fetchData } = useLoader({})
	const { t } = useTranslation()
	const isSkipRender = useRef(false)

	const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	};

    function handleSort(column, sort) {
        if(sort === 'asc') {
            setSort(column.header)
        } else {
            setSort('-' + column.header)
        }
    }

	async function getData() {
		let args = []

		if (isApiGetFuncArgsDefault) args = { page: current_page, limit: rows_per_page, sort: sortField, search: search_value, ...apiGetFuncArgs }
		else args = apiGetFuncArgs

		const { success, data } = await fetchData(apiGetFunc({ ...args }))

		if (success) {
			let finalData = []
			let finalCount = 0

			if (isApiGetFuncArgsDefault) {
				finalData = data?.results
				finalCount = data?.count
			} else {
				finalData = data
				finalCount = data?.length
			}

			if (finalData?.length) {
				setTotalCount(finalCount)

				// #region specific code (not generic)
				// to add footer data
				if (['groups','professions'].includes(apiGetFuncArgs.report_type)) {
					const footerRow = {}

					// to add first column with according name
					if (apiGetFuncArgs.report_type === 'groups') {
						footerRow['group_name'] = "Нийт"
					} else if (apiGetFuncArgs.report_type === 'professions') {
						footerRow['profession_name'] = "Нийт"
					}

					footerRow['student_count'] = sumValues(finalData, "student_count"),
					footerRow['A2_count'] = sumValues(finalData, "A2_count"),
					footerRow['A_count'] = sumValues(finalData, "A_count"),
					footerRow['B2_count'] = sumValues(finalData, "B2_count"),
					footerRow['B_count'] = sumValues(finalData, "B_count"),
					footerRow['C2_count'] = sumValues(finalData, "C2_count"),
					footerRow['C_count'] = sumValues(finalData, "C_count"),
					footerRow['D_count'] = sumValues(finalData, "D_count"),
					footerRow['F_count'] = sumValues(finalData, "F_count")
					finalData.push(footerRow)
				}
				// #endregion
			}

			setData(finalData)
		}
	}

	useEffect(() => {
		if (isSkipRender.current) getData()
		else isSkipRender.current = true
	}, [search_value, render_to_search, current_page, sortField])

	// #region specific code (not generic)
	useEffect(() => {
		if (apiGetFuncArgs && apiGetFuncArgs.lesson_year && apiGetFuncArgs.lesson_season && apiGetFuncArgs.start_date && apiGetFuncArgs.end_date) getData()
	}, [apiGetFuncArgs])
	// #endregion

	// for table footer
	const sumValues = (data, field) => {
		return data.reduce((total, item) => total + item[field], 0);
	};

	return (
		<DataTable
			data={data}
			columns={getColumns(current_page, rows_per_page, total_count, columns)}
			pagination
			paginationServer
			progressPending={isLoading}
			paginationPerPage={rows_per_page}
			paginationDefaultPage={current_page}
			paginationComponent={getPagination(handlePagination, current_page, rows_per_page, total_count)}
			onSort={handleSort}
			sortIcon={<ChevronDown size={10} />}
			progressComponent={
				<div className='my-2 d-flex align-items-center justify-content-center'>
					<Spinner className='me-1' color="" size='sm' /><h5>{t('Түр хүлээнэ үү')}...</h5>
				</div>
			}
			conditionalRowStyles={conditionalRowStyles}
			noDataComponent={(
				<div className="my-2">
					<h5>{t('Өгөгдөл байхгүй байна')}</h5>
				</div>
			)}
		/>
	)
}

function getColumns(current_page, rows_per_page, total_count, columns) {
	const page_count = Math.ceil(total_count / rows_per_page)

	if (current_page > page_count) {
		current_page = 1
	}

	const defaultColumns = [
		{
			name: "№",
			selector: (row, index) => index < total_count ? (current_page - 1) * rows_per_page + index + 1 : '',
			minWidth: '50px',
			maxWidth: "70px",
			center: true
		}
	]

	columns = [...defaultColumns, ...columns]

	return columns
}

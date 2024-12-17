import useLoader from "@src/utility/hooks/useLoader"
import { getPagination } from "@src/utility/Utils"
import { useEffect, useRef, useState } from "react"
import DataTable from "react-data-table-component"
import { useTranslation } from "react-i18next"
import { Spinner } from "reactstrap"

export default function GenericDataTable({ apiGetFunc, apiGetFuncArgs, isApiGetFuncArgsDefault, columns, rows_per_page, search_value, render_to_search }) {
	// states
	const [current_page, setCurrentPage] = useState(1)
	const [total_count, setTotalCount] = useState(1)
	const [data, setData] = useState([])

	const { isLoading, fetchData } = useLoader({})
	const { t } = useTranslation()
	const isSkipRender = useRef(false)

	const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	};

	async function getData() {
		let args = []

		if (isApiGetFuncArgsDefault) args = [current_page, rows_per_page, search_value, ...apiGetFuncArgs]
		else args = apiGetFuncArgs

		const { success, data } = await fetchData(apiGetFunc(...args))

		if (success) {
			if (isApiGetFuncArgsDefault) {
				setData(data?.results)
				setTotalCount(data?.count)
			}
			else {
				setData(data)
				setTotalCount(data?.length)
			}
		}
	}

	useEffect(() => {
		if (isSkipRender.current) getData()
		else isSkipRender.current = true
	}, [search_value, render_to_search, current_page])

	// #region specific code (not generic)
	useEffect(() => { if (apiGetFuncArgs[1]) getData() }, [apiGetFuncArgs[1]])
	// #endregion

	return (
		<DataTable
			pagination
			progressPending={isLoading}
			progressComponent={
				<div className='my-2 d-flex align-items-center justify-content-center'>
					<Spinner className='me-1' color="" size='sm' /><h5>{t('Түр хүлээнэ үү')}...</h5>
				</div>
			}
			noDataComponent={(
				<div className="my-2">
					<h5>{t('Өгөгдөл байхгүй байна')}</h5>
				</div>
			)}
			columns={getColumns(current_page, rows_per_page, total_count, columns)}
			paginationPerPage={rows_per_page}
			paginationDefaultPage={current_page}
			data={data}
			paginationComponent={getPagination(handlePagination, current_page, rows_per_page, total_count)}
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
			selector: (row, index) => (current_page - 1) * rows_per_page + index + 1,
			maxWidth: "30px",
			center: true
		}
	]

	columns = [...defaultColumns, ...columns]

	return columns
}

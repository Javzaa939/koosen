import { getPagination } from "@src/utility/Utils";
import DataTable from "react-data-table-component";
import { useTranslation } from "react-i18next";
import { ExpandedComponent, getColumns, handleSort, onSelectedRowsChange, searchComponent } from "./helpers";
import { handlePagination } from "./helpers";
import { ChevronDown } from "react-feather";
import { Spinner } from "reactstrap";

export default function FullSetDataTable({
	currentPage,
	setCurrentPage,
	searchValue,
	setSearchValue,
	rowsPerPage,
	setRowsPerPage,
	data,
	isLoading,
	totalCount,
	setSort,
	setSelectedRows,
	defaultPage,
	closeSessions,
	toggleCleared,
}) {
	const { t } = useTranslation()

	return (
		// TODO:
		//  - how to reset sort to default
		<div className='react-dataTable react-dataTable-selectable-rows mx-1'>
			{/* sometimes needed */}
			{/* <div className='react-dataTable react-dataTable-selectable-rows' id='datatableLeftOneRightOne'> */}
			<DataTable
				className='react-dataTable'
				// sometimes needed
				// className='react-dataTable-header-md'
				columns={getColumns(currentPage, rowsPerPage, totalCount, t)}
				data={data}

				noDataComponent={(
					<div className="my-2">
						<h5>{t('Өгөгдөл байхгүй байна')}</h5>
					</div>
				)}

				// #region progress
				progressPending={isLoading}
				progressComponent={
					<div className='my-2 d-flex align-items-center justify-content-center'>
						<Spinner className='me-1' color="" size='sm' /><h5>{t('Түр хүлээнэ үү')}...</h5>
					</div>
				}
				// #endregion

				// fixed header
				fixedHeader
				fixedHeaderScrollHeight='62vh'

				// pagination
				pagination
				paginationServer
				paginationComponent={getPagination((page) => handlePagination(page, setCurrentPage), currentPage, rowsPerPage, totalCount)}
				// not needed in this prop group if pagination server is true
				// paginationPerPage={rowsPerPage}
				// paginationDefaultPage={currentPage}

				// #region expandable rows
				expandableRows

				expandableRowsComponent={(data) => ExpandedComponent({
					data: data,
					t: t,
					closeSessions: closeSessions,
				})}
				// #endregion

				// subheader
				subHeader
				subHeaderComponent={searchComponent(searchValue, setSearchValue, rowsPerPage, setRowsPerPage, defaultPage, t)}

				// sorting
				onSort={(column, sort) => handleSort(column, sort, setSort)}
				sortIcon={<ChevronDown size={10} />}
				// not needed in this prop group, maybe, no any effect is detected
				// defaultSortFieldId={'id'}

				// selectable rows
				selectableRows
				onSelectedRowsChange={(state) => onSelectedRowsChange(state, setSelectedRows)}
				clearSelectedRows={toggleCleared}
			// not needed in this prop group, maybe
			// selectableRowSelected={row => is_change ? row?.is_selected : row?.selected}

			// #region sometimes needed
			// highlightOnHover={true}
			// noTableHead
			// title={datas && datas.length > 0 && datas.filter(data => is_change ? data.is_selected : data.selected).length > 0 ? "Оюутны жагсаалт" : ''}

			// #region custom styles
			// customStyles={tableCustomStyles}

			// const tableCustomStyles = {
			// 	headCells: {
			// 		style: {
			// 			backgroundColor: '#9CD9F3'
			// 		},
			// 	},
			// }

			// another style example
			// export const customStyles = {
			// 	header: {
			// 		style: {
			// 			fontSize: "14px",
			// 		},
			// 	},
			// 	headRow: {
			// 		style: {
			// 			color: "white",
			// 			fontSize: "11px",
			// 			backgroundColor: "#008cff",
			// 			borderTopStyle: 'solid',
			// 			borderTopWidth: '1px',
			// 			borderTopColor: defaultThemes.default.divider.default,
			// 		},
			// 	},
			// 	headCells: {
			// 		style: {
			// 			minHeight: "42px",
			// 			'&:not(:last-of-type)': {
			// 				borderRightStyle: 'solid',
			// 				borderRightWidth: '1px',
			// 				borderRightColor: defaultThemes.default.divider.default,
			// 			},
			// 		},
			// 	},
			// 	cells: {
			// 		style: {
			// 			'&:not(:last-of-type)': {
			// 				borderRightStyle: 'solid',
			// 				borderRightWidth: '1px',
			// 				borderRightColor: defaultThemes.default.divider.default,
			// 			},
			// 		},
			// 	},
			// };
			// #endregion
			// #endregion sometimes needed

			// #region maybe not needed props. no any effect is detected
			// noHeader
			// style={{ border: '1px solid red' }}
			// responsive
			// print='true'
			// theme="solarized"
			// direction="auto"

			// contextMessage={
			// 	{
			// 		singular: '',
			// 		plural: '',
			// 		message: 'оюутан сонгосон байна.'
			// 	}
			// }
			// #endregion
			/>
		</div>
	)
}

import { getPagination } from "@src/utility/Utils";
import DataTable from "react-data-table-component";
import { useTranslation } from "react-i18next";
import { ExpandedComponent, getColumns, handleSort, searchComponent } from "./helpers";
import { handlePagination } from "./helpers";
import { ChevronDown } from "react-feather";

export default function FullSetDataTable({
	data,
	isLoading,
	currentPage,
	rowsPerPage,
	totalCount,
	setCurrentPage,
	searchValue,
	setSearchValue,
	sort,
	setSort
}) {
	const { t } = useTranslation()

	function closeSession(row) {
		console.log('close session', row)
	}

	return (
		<div className='react-dataTable react-dataTable-selectable-rows mx-1'>
			<DataTable
				noHeader
				className='react-dataTable'

				// #region progress
				progressPending={isLoading}
				progressComponent={<h5>{t('Түр хүлээнэ үү')}...</h5>}

				noDataComponent={(
					<div className="my-2">
						<h5>{t('Өгөгдөл байхгүй байна')}</h5>
					</div>
				)}
				// #endregion

				columns={getColumns(currentPage, rowsPerPage, totalCount, t)}
				data={data}

				// fixedheader
				fixedHeader
				fixedHeaderScrollHeight='62vh'

				// pagination
				pagination
				paginationServer
				paginationPerPage={rowsPerPage}
				paginationDefaultPage={currentPage}
				paginationComponent={getPagination((page) => handlePagination(page, setCurrentPage), currentPage, rowsPerPage, totalCount)}

				// #region expandable rows
				expandableRows

				expandableRowsComponent={(data) => ExpandedComponent({
					data: data,
					t: t,
					closeSession: closeSession,
				})}
				// #endregion

				// subheader
				subHeader
				subHeaderComponent={searchComponent(searchValue, setSearchValue, t)}

				// sorting
				onSort={(column, sort) => handleSort(column, sort, setSort)}
				sortIcon={<ChevronDown size={10} />}

			// TODO:
			//  - selectablerows
			//  - rows per page selector
			/>
		</div>
	)
}

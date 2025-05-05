import { getPagination } from "@src/utility/Utils";
import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { ChevronDown } from "react-feather";
import { useTranslation } from "react-i18next";
import { RiComputerLine } from "react-icons/ri";
import {
	Col,
	ListGroup,
	ListGroupItem,
	Modal,
	ModalBody,
	ModalHeader,
	Spinner
} from "reactstrap";
import FullSetDataTable from "../FullSetDataTable";
import useLoader from "@src/utility/hooks/useLoader";
import useApi from "@src/utility/hooks/useApi";

export default function ModalByStudent({
	isOpen,
	toggle,
}) {
	const { t } = useTranslation()
	const { fetchData, isLoading } = useLoader({})

	// pagination
	const [currentPage, setCurrentPage] = useState(1)
	const default_page = ['Бүгд', 10, 20, 50, 75, 100]
	const [rowsPerPage, setRowsPerPage] = useState(default_page[2])
	const [totalCount, setTotalCount] = useState()

	const [searchValue, setSearchValue] = useState()
	const [sort, setSort] = useState('-id')
	const [data, setData] = useState()

	const accessHistoryStudentAPI = useApi().calendar.accessHistoryStudent

	async function getData() {
		const { success, data } = await fetchData(
			accessHistoryStudentAPI.get({
				limit: rowsPerPage,
				page: currentPage,
				search: searchValue,
				sort: sort
			})
		);

		if (success && data) {
			setData(data.results);
			setTotalCount(data.count)
		}
	}

	useEffect(() => {
		getData()
	}, [currentPage, rowsPerPage, sort])

	useEffect(() => {
		if (searchValue?.length == 0) {
			getData();
		} else {
			const timeoutId = setTimeout(() => {
				getData();
			}, 600);

			return () => clearTimeout(timeoutId);
		}
	}, [searchValue]);

	return (
		<Modal
			isOpen={isOpen}
			toggle={toggle}
			className="modal-dialog-centered modal-lg"
		>
			<ModalHeader toggle={toggle}>
				<span className="text-primary">{t('Хандалтын түүхүүд')}</span>
			</ModalHeader>
			<ModalBody>
				<FullSetDataTable
					data={data}
					isLoading={isLoading}
					currentPage={currentPage}
					rowsPerPage={rowsPerPage}
					totalCount={totalCount}
					setCurrentPage={setCurrentPage}
					searchValue={searchValue}
					setSearchValue={setSearchValue}
					sort={sort}
					setSort={setSort}
				/>
			</ModalBody>
		</Modal>
	)
}
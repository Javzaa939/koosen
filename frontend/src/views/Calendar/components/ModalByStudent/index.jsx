import useApi from "@src/utility/hooks/useApi";
import useLoader from "@src/utility/hooks/useLoader";
import { useEffect, useState } from "react";
import { LogOut } from "react-feather";
import { useTranslation } from "react-i18next";

import {
	Button,
	Modal,
	ModalBody,
	ModalHeader
} from "reactstrap";

import FullSetDataTable from "../FullSetDataTable";

export default function ModalByStudent({
	isOpen,
	toggle,
}) {
	const { t } = useTranslation()
	const { fetchData, isLoading } = useLoader({})

	// pagination
	const [currentPage, setCurrentPage] = useState(1)
	const defaultPage = ['Бүгд', 10, 20, 50, 75, 100]
	const [rowsPerPage, setRowsPerPage] = useState(defaultPage[2])
	const [totalCount, setTotalCount] = useState()

	const [searchValue, setSearchValue] = useState()
	const [sort, setSort] = useState('-id')
	const [selectedRows, setSelectedRows] = useState([])
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

	function closeSession(row) {
		console.log('close session', row)
	}

	function closeSessionMass() {
		selectedRows.forEach(row => closeSession(row))
	}

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
					totalCount={totalCount}
					setSort={setSort}
					setSelectedRows={setSelectedRows}
					defaultPage={defaultPage}
					closeSession={closeSession}
					currentPage={currentPage}
					setCurrentPage={setCurrentPage}
					searchValue={searchValue}
					setSearchValue={setSearchValue}
					rowsPerPage={rowsPerPage}
					setRowsPerPage={setRowsPerPage}
				/>
				<div className="text-center">
					<Button
						size='sm'
						className='ms-50 mb-50'
						color='primary'
						onClick={closeSessionMass}
						disabled={selectedRows.length < 1}
					>
						<LogOut width={"15px"} />
						<span className='align-middle ms-50'>{t('Сонгосон сессүүдийг бүгдийг хаах')}</span>
					</Button>
				</div>
			</ModalBody>
		</Modal>
	)
}
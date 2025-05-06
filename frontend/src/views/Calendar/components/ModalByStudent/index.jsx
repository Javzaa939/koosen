import useApi from "@src/utility/hooks/useApi";
import useLoader from "@src/utility/hooks/useLoader";
import { useEffect, useState } from "react";
import { LogOut } from "react-feather";
import { useTranslation } from "react-i18next";

import {
	Button,
	Col,
	Label,
	Modal,
	ModalBody,
	ModalHeader,
	Row
} from "reactstrap";

import FullSetDataTable from "../FullSetDataTable";
import { clearSelected } from "../FullSetDataTable/helpers";
import SimpleSelectFilter from "../SimpleSelectFilter";

const MOBILE = 1
const TABLET = 2
const PC = 3

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

	// selected rows
	const [selectedRows, setSelectedRows] = useState([])
	const [toggleCleared, setToggleCleared] = useState(false);

	const [searchValue, setSearchValue] = useState()
	const [sort, setSort] = useState('-id')
	const [data, setData] = useState()
	const [filters, setFilters] = useState()

	const accessHistoryStudentAPI = useApi().calendar.accessHistoryStudent

	async function getData() {
		const { success, data } = await fetchData(
			accessHistoryStudentAPI.get({
				limit: rowsPerPage,
				page: currentPage,
				search: searchValue,
				sort: sort,
				outTime: filters?.outTime,
				deviceType: filters?.deviceType,
			})
		);

		if (success && data) {
			setData(data.results);
			setTotalCount(data.count)
		}
	}

	useEffect(() => {
		getData()
	}, [currentPage, rowsPerPage, sort, filters])

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

	async function closeSessions(rows) {
		const idList = Array.isArray(rows) ? rows.map(row => row.id) : [rows.id]

		const { success } = await fetchData(
			accessHistoryStudentAPI.putCloseSessions([idList])
		);

		if (success) {
			clearSelected(setToggleCleared, setSelectedRows)
			getData()
		}
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
				<Row className="mb-1">
					<Col md={3} className="d-flex flex-column justify-content-between">
						<Label for='out_time'>{t('Гаралт огноо')}</Label>
						<SimpleSelectFilter
							fieldName={'out_time'}
							isStaticOptions={true}
							getApi={() => [
								{ value: true, label: 'Бөглөгдсөн' },
								{ value: false, label: 'Хоосон' },
							]}
							getOptionLabel={(option) => option.label}
							getOptionValue={(option) => option.value}
							optionValueFieldName={'value'}
							setParentSelectedOption={(newValue) => setFilters(current => ({ ...current, outTime: newValue }))}
						/>
					</Col>
					<Col md={3}>
						<Label for='device_type'>{t('Нэвтэрсэн төхөөрөмжийн төрөл')}</Label>
						<SimpleSelectFilter
							fieldName={'device_type'}
							isStaticOptions={true}
							getApi={() => [
								{ value: MOBILE, label: "Утас" },
								{ value: TABLET, label: "Таблет" },
								{ value: PC, label: "Компютер" },
							]}
							getOptionLabel={(option) => option.label}
							getOptionValue={(option) => option.value}
							optionValueFieldName={'value'}
							setParentSelectedOption={(newValue) => setFilters(current => ({ ...current, deviceType: newValue }))}
						/>
					</Col>
				</Row>
				<Row>
					<Col>
						<FullSetDataTable
							currentPage={currentPage}
							setCurrentPage={setCurrentPage}
							searchValue={searchValue}
							setSearchValue={setSearchValue}
							rowsPerPage={rowsPerPage}
							setRowsPerPage={setRowsPerPage}
							data={data}
							isLoading={isLoading}
							totalCount={totalCount}
							setSort={setSort}
							setSelectedRows={setSelectedRows}
							defaultPage={defaultPage}
							closeSessions={closeSessions}
							toggleCleared={toggleCleared}
						/>
					</Col>
				</Row>
				<Row className="text-center">
					<Col>
						<Button
							size='sm'
							className='ms-50 mb-50'
							color='primary'
							onClick={() => closeSessions(selectedRows)}
							disabled={selectedRows.length < 1}
						>
							<LogOut width={"15px"} />
							<span className='align-middle ms-50'>{t('Сонгосон сессүүдийг бүгдийг хаах')}</span>
						</Button>
					</Col>
				</Row>
			</ModalBody>
		</Modal>
	)
}
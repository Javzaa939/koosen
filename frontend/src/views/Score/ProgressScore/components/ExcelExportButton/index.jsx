import excelDownload from "@src/utility/excelDownload";
import useToast from "@src/utility/hooks/useToast";
import { downloadCSV, transliterate } from "@src/utility/Utils";
import { Download, FileText, Grid } from "react-feather";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledButtonDropdown } from "reactstrap";

export default function ExcelExportButton({ data }) {
	const page_name = 'Явцын_оноо'

	const excelColumns = {
		'index': '№',
		'student_code': 'Оюутны код',
		'student_full_name': 'Оюутны нэр',
		'group_name': "Ангийн нэр",
		'teacher_name': 'Багшийн нэр',
		'teach_score': 'Багшийн оноо',
		'exam_score': 'Шалгалтын оноо',
		'assessment': 'Үсгэн үнэлгээ',
	}

	const addToast = useToast()

	function excelHandler(cdatas) {
		const rowInfo = {
			headers: Object.keys(excelColumns).map((key) => excelColumns[key]),
			datas: Object.keys(excelColumns).map((key) => key),
		}

		excelDownload(cdatas, rowInfo, transliterate(page_name))
	}

	async function excelAllDownload(type) {
		var keys = Object.keys(excelColumns)

		if (data) {
			data.forEach((cdata) => {
				for (let key in cdata) {
					if (!keys.includes(key)) {
						delete cdata[key]
					}
				}
			})

			if (type === 'excel') {
				excelHandler(data)
			} else if (type === 'csv') {
				downloadCSV([data], excelColumns, page_name)
			}

		} else {
			addToast({
				text: "Файл татахад алдаа гарлаа",
				type: "warning"
			})
		}
	}

	return (
		<div className='d-flex flex-wrap mt-md-0'>
			<UncontrolledButtonDropdown>
				<DropdownToggle color='secondary' className='m-50' caret outline>
					<Download size={15} />
					<span className='align-middle ms-50'>Export</span>
				</DropdownToggle>
				<DropdownMenu>
					<DropdownItem className='w-100' onClick={() => excelAllDownload('csv')}>
						<FileText size={15} />
						<span className='align-middle ms-50'>CSV</span>
					</DropdownItem>
					<DropdownItem className='w-100' onClick={() => excelAllDownload('excel')}>
						<Grid size={15} />
						<span className='align-middle ms-50' >Excel</span>
					</DropdownItem>
				</DropdownMenu>
			</UncontrolledButtonDropdown>
		</div>
	)
}
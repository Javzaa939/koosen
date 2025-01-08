import excelDownload from "@src/utility/excelDownload";
import useToast from "@src/utility/hooks/useToast";
import { transliterate } from "@src/utility/Utils";
import { FileText } from "react-feather";
import { useTranslation } from "react-i18next";
import { Button } from "reactstrap";

export default function ExcelExportButton({ data }) {
	const addToast = useToast()
    const { t } = useTranslation()

	const page_name = 'Явцын_оноо'

	const excelColumns = {
		'index': '№',
		'student_code': t('Оюутны код'),
		'student_full_name': t('Оюутны нэр'),
		'group_name': "Ангийн нэр",
		'teacher_name': t('Багшийн нэр'),
		'teach_score': t('Багшийн оноо'),
		'exam_score': t('Шалгалтын оноо'),
		'assessment': t('Үсгэн үнэлгээ'),
	}

	function excelHandler(cdatas) {
		const rowInfo = {
			headers: Object.keys(excelColumns).map((key) => excelColumns[key]),
			datas: Object.keys(excelColumns).map((key) => key),
		}

		excelDownload(cdatas, rowInfo, transliterate(page_name))
	}

	async function excelAllDownload() {
		var keys = Object.keys(excelColumns)

		if (data) {
			data.forEach((cdata) => {
				for (let key in cdata) {
					if (!keys.includes(key)) {
						delete cdata[key]
					}
				}
			})

			excelHandler(data)

		} else {
			addToast({
				text: t("Файл татахад алдаа гарлаа"),
				type: "warning"
			})
		}
	}

	return (
		<Button
			color='primary'
			onClick={() => { excelAllDownload() }}
		>
			<FileText size={16} /> {t('Excel татах')}
		</Button>
	)
}

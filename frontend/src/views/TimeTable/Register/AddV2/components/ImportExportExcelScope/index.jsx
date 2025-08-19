// not custom
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select'
import classNames from 'classnames';
import { Label } from 'reactstrap';

// custom global
import FileModal from '@src/components/FileModal';
import useLoader from '@src/utility/hooks/useLoader';
import useApi from '@src/utility/hooks/useApi';
import { ReactSelectStyles } from '@src/utility/Utils';

// custom not global
import ImportExportExcel from '../ImportExportExcel';
import GeneralModal from '../GeneralModal';


export default function ImportExportExcelScope({ isDisabled, refreshDatas }) {
	const [importModal, setImportModal] = useState(false)
	const [exportModal, setExportModal] = useState(false)
	const [file, setFile] = useState('')
	const [timetableType, setTimetableType] = useState()

	const { isLoading, fetchData } = useLoader({})
	const { t } = useTranslation()
	const timetableApi = useApi().timetable.register

	const linkToTemplate = {
		'Энгийн': '/assets/import_templates/timetable/zagwar-simple.xlsx',
		'Блок': '/assets/import_templates/timetable/zagwar-block.xlsx',
		'Кураци': '/assets/import_templates/timetable/zagwar-kurats_date.xlsx',
		'Огноогоор': '/assets/import_templates/timetable/zagwar-kurats_date.xlsx',
	}

	const toggleImportModal = () => {
		setTimetableType()
		setImportModal(!importModal)
	}

	const toggleExportModal = () => {
		setTimetableType()
		setExportModal(!exportModal)
	}

	async function onSubmit() {
		if (file) {
			const formData = new FormData()
			formData.append('file', file)
			formData.append('timetableType', timetableType)

			const { success, data } = await fetchData(timetableApi.excelImport({ data: formData }))

			if (success) {
				toggleImportModal()
				refreshDatas()
			}

		}
	}

	return (
		<>
			<ImportExportExcel
				isDisabledImport={isDisabled}
				importModal={toggleImportModal}
				exportModal={toggleExportModal}
				toggleName={t(`Хуваарь оруулах`)}
			/>
			{
				exportModal &&
				<GeneralModal
					isOpen={exportModal}
					buttonLink={linkToTemplate[timetableType]}
					isDisabled={!timetableType}
					toggle={toggleExportModal}
					BodyComponent={SelectTimetableType}
					bodyComponentProps={{ setTimetableType: setTimetableType }}
					buttonText={t('Загвар татах')}
					title={t("Загвар татах")}
				/>
			}
			{
				importModal &&
				<FileModal
					isOpen={importModal}
					handleModal={toggleImportModal}
					title={t("Загвар оруулах")}
					fileAccept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
					extension={['xlsx']}
					file={file}
					setFile={setFile}
					onSubmit={onSubmit}
					isLoading={isLoading}
					Component={SelectTimetableType}
					setTimetableType={setTimetableType}
				/>
			}
		</>
	)
}

function SelectTimetableType(props) {

	const {
		setTimetableType
	} = props

	return (
		<div className='mb-1'>
			<Label className="form-label" for="timetable_type">
				{'Хуваарь оруулах төрөл'}
			</Label>
			<Select
				name="timetable_type"
				id="timetable_type"
				classNamePrefix='select'
				isClearable
				className={classNames('react-select')}
				placeholder={'-- Сонгоно уу --'}
				options={['Энгийн', 'Блок', 'Кураци', 'Огноогоор'].map(item => ({ value: item, label: item }))}
				noOptionsMessage={() => 'Хоосон байна.'}
				onChange={(val) => {
					setTimetableType(val?.value || '')
				}}
				styles={ReactSelectStyles}
			/>
		</div>
	)
}

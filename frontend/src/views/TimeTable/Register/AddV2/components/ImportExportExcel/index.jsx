import { useState } from "react";
import { ArrowDown, Download, FileText } from "react-feather";
import { useTranslation } from "react-i18next";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "reactstrap";
import { utils, writeFile } from "xlsx-js-style";

export default function ImportExportExcel({
	isDisabledImport = false,
	importModal = () => null,
	exportModal,
	inputData = [],
	columnsMap = [],
	fileName = 'export.xlsx',
	sheetName = "Sheet1",
	toggleName = `Template data insertion`
}) {
	const { t } = useTranslation()
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const togglev2 = () => setDropdownOpen((prevState) => !prevState);

	return (
		<div style={{ height: '41px' }}>
			<Dropdown isOpen={dropdownOpen} toggle={togglev2}>
				<DropdownToggle color="primary" className="me-50">
					<ArrowDown size={15} className='me-50' />
					<span className="align-middle">
						{toggleName}
					</span>
				</DropdownToggle>
				<DropdownMenu>
					<DropdownItem
						onClick={exportModal || (() => excelExport({
							inputData: inputData,
							columnsMap: columnsMap,
							fileName: fileName,
							sheetName: sheetName
						}))}
					>
						<Download size={15} />
						<span className="align-middle ms-1">
							{t("Загвар татах")}
						</span>
					</DropdownItem>
					<DropdownItem divider />
					<DropdownItem
						onClick={
							(e) => isDisabledImport ? e.preventDefault() : importModal()
						}
						className={isDisabledImport ? 'disabled' : ''}
					>
						<FileText size={15} />
						<span className="align-middle ms-1">
							{t("Загвар оруулах")}
						</span>
					</DropdownItem>
				</DropdownMenu>
			</Dropdown>
		</div>
	)
}

export function excelExport({
	inputData = [],
	columnsMap = [],
	fileName = 'export.xlsx',
	sheetName = "Sheet1",
	headerDoc,
}) {
	// #region to define data
	const indexName = '№'
	columnsMap.unshift({ name: indexName })

	// to display empty table if no data
	if (!inputData.length) inputData = [{}]

	const data = inputData.map((col, idx) => {
		const rowData = {}

		if (columnsMap.length)
			for (let i = 0; i < columnsMap.length; i++) {
				const exportColName = columnsMap[i]['name']
				const inputColName = columnsMap[i]['header']

				if (exportColName === indexName) rowData[exportColName] = idx + 1
				else rowData[exportColName] = col[inputColName] ? col[inputColName] : ''
			}

		return rowData;
	});
	// #endregion

	// #region sheet sections positions
	const sectionsPositions = {
		sheetHeader: {
			startingCell: { r: 0, c: 0 },
			endingCell: { r: headerDoc.length, c: 0 } // TODO: determine max "c" value
		},
		data: {
			startingCell: { r: headerDoc.length + 1, c: 0 },
			endingCell: { r: data.length, c: columnsMap.length }
		}
	}
	// #endregion

	// #region to add data
	const worksheet = utils.json_to_sheet([]);

	utils.sheet_add_aoa(worksheet, headerDoc, { origin: sectionsPositions.sheetHeader.startingCell });
	utils.sheet_add_json(worksheet, data, { origin: sectionsPositions.data.startingCell });

	const workbook = utils.book_new();
	utils.book_append_sheet(workbook, worksheet, sheetName);
	// #endregion

	// #region to define styles
	const normalCells = {
		border: {
			top: { style: "thin", color: { rgb: "000000" } },
			bottom: { style: "thin", color: { rgb: "000000" } },
			left: { style: "thin", color: { rgb: "000000" } },
			right: { style: "thin", color: { rgb: "000000" } }
		},
		font: {
			sz: 10
		},
		alignment: {
			horizontal: 'center',
			vertical: 'center',
			wrapText: true
		},
	};
	// #endregion

	// #region to format cells by styles
	const startRow = sectionsPositions.data.startingCell.r;
	const endRow = sectionsPositions.data.endingCell.r;
	const startCol = sectionsPositions.data.startingCell.c;
	const endCol = sectionsPositions.data.endingCell.c;

	for (let row = startRow; row <= endRow; row++) {
		for (let col = startCol; col <= endCol; col++) {
			const cellAddress = utils.encode_cell({ r: row, c: col });

			if (!worksheet[cellAddress]) {
				worksheet[cellAddress] = {};
			}

			worksheet[cellAddress].s = normalCells
		}
	}
	// #endregion

	// #region to format cells by sizes
	worksheet["!cols"] = [{ wch: 2 }, { wch: 40 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 15 }];

	const rowHeights = new Array(Number(worksheet["!ref"].split(":")[1].match(/\d+/)[0]))
		.fill(null)
		.map(() => ({ hpx: 25 }));

	worksheet["!rows"] = rowHeights;
	// #endregion

	return writeFile(workbook, fileName)
}

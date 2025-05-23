import { downloadExcelReport } from "../Participants/downloadExcelReport";
import { downloadIQExcelReport } from "../Participants/downloadIQExcelReport";

export async function resultExcelReport(active, excelApi, adm, test, fetchData) {
	if (active === 2) {
		const { success, data } = await fetchData(excelApi.excelResult(adm, test.id));
		if (success) downloadExcelReport(data)
	} else {
		const { success, data } = await fetchData(excelApi.excelResultByScope(active, test.id));
		if (success) downloadExcelReport(data)
	}
}

export async function IQresultExcelReport(active, excelApi, adm, test, fetchData) {
	if (active === 2) {
		const { success, data } = await fetchData(excelApi.iqExcelResult(adm, test.id));
		if (success) downloadIQExcelReport(data)
	} else {
		const { success, data } = await fetchData(excelApi.iqExcelResultByScope(active, test.id));
		if (success) downloadIQExcelReport(data)
	}
}

export const TYPE_IQ = 1
export const TYPE_PSY = 2

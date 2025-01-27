import ChartByAcademicYear from "../../components/ChartByAcademicYear";
import ChartBySchool from "../../components/ChartBySchool";
import TableByClass from "../../components/TableByClass";
import TableBySchool from "../../components/TableBySchool";

export default function SeasonExamReport() {
	return (
		<>
			<ChartBySchool />
			<TableBySchool />
			<ChartByAcademicYear />
			<TableByClass />
		</>
	)
}
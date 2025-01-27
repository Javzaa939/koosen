import ChartByAcademicYear from "../../components/ChartByAcademicYear";
import ChartBySchool from "../../components/ChartBySchool";
import TableByClass from "../../components/TableByClass";
import TableBySchool from "../../components/TableBySchool";

export default function ReExamReport() {
	return (
		<>
			<ChartBySchool examType={'reexam'} />
			<TableBySchool examType={'reexam'} />
			<ChartByAcademicYear examType={'reexam'} />
			<TableByClass examType={'reexam'} />
		</>
	)
}
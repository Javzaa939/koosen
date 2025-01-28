import ChartByAnyField from "../../components/ChartByAnyField";
import TableByClass from "../../components/TableByClass";
import TableBySchool from "../../components/TableBySchool";

export default function SemesterExamReport({ data, scoreRanges, isLoading, examType, level2_key1, level2_key2, main_school_name }) {
	const level2_key1_name = level2_key1[0]
	const level2_key2_name = level2_key2[0]
	const examTypeData = data.filter(item => item.is_repeat === (examType === 'reExam'))
	const counts = {}
	counts[main_school_name] = { [level2_key1_name]: 0, [level2_key2_name]: 0 }

	const students_count = examTypeData.length
	const a_students_count = examTypeData.filter(item => scoreRanges.A.score_min <= item.score && item.score <= scoreRanges.A.score_max).length
	const b_students_count = examTypeData.filter(item => scoreRanges.B.score_min <= item.score && item.score <= scoreRanges.B.score_max).length
	const c_students_count = examTypeData.filter(item => scoreRanges.C.score_min <= item.score && item.score <= scoreRanges.C.score_max).length
	const d_students_count = examTypeData.filter(item => scoreRanges.D.score_min <= item.score && item.score <= scoreRanges.D.score_max).length
	const f_students_count = examTypeData.filter(item => scoreRanges.F.score_min <= item.score && item.score <= scoreRanges.F.score_max).length

	counts[main_school_name][level2_key1_name] = ((f_students_count + b_students_count) * 100) / students_count
	counts[main_school_name][level2_key2_name] = ((a_students_count + b_students_count + c_students_count) * 100) / students_count

	const mainSchoolData = {
		success_quality: counts,
		all: students_count,
		a: a_students_count,
		b: b_students_count,
		c: c_students_count,
		d: d_students_count,
		f: f_students_count,
	}

	return (
		<>
			<ChartByAnyField scoreRanges={scoreRanges} isLoading={isLoading} examTypeData={examTypeData} mainSchoolData={counts} level2_key1={level2_key1} level2_key2={level2_key2} level1_key={['school_name']} chartTitle={'Бүрэлдэхүүн сургууль, институт'} />
			<TableBySchool scoreRanges={scoreRanges} isLoading={isLoading} examTypeData={examTypeData} mainSchoolData={mainSchoolData} />
			<ChartByAnyField scoreRanges={scoreRanges} isLoading={isLoading} examTypeData={examTypeData} mainSchoolData={counts} level2_key1={level2_key1} level2_key2={level2_key2} level1_key={['group_level']} chartTitle={'Дамжаа (Их сургууль)'} />
			{/* <TableByClass scoreRanges={scoreRanges} isLoading={isLoading} examTypeData={examTypeData} /> */}
		</>
	)
}
import ChartByAnyField from "../../components/ChartByAnyField";
import TableByClass from "../../components/TableByClass";
import TableBySchool from "../../components/TableBySchool";

export default function SemesterExamReport({ data, scoreRanges, isLoading, examType, level2_key1, level2_key2, main_school_name }) {
	const level1_key1 = ['school_name']
	const level1_key2 = ['group_level']
	const level2_key1_name = level2_key1[0]
	const level2_key2_name = level2_key2[0]
	const examTypeData = data.filter(item => item.is_repeat === (examType === 'reExam'))
	const counts = {}
	counts[main_school_name] = { [level2_key1_name]: 0, [level2_key2_name]: 0 }

	const students_count = examTypeData.length
	const a_students_count = examTypeData.filter(item => scoreRanges.A.score_min <= item.total_score && item.total_score <= scoreRanges.A.score_max).length
	const b_students_count = examTypeData.filter(item => scoreRanges.B.score_min <= item.total_score && item.total_score <= scoreRanges.B.score_max).length
	const c_students_count = examTypeData.filter(item => scoreRanges.C.score_min <= item.total_score && item.total_score <= scoreRanges.C.score_max).length
	const d_students_count = examTypeData.filter(item => scoreRanges.D.score_min <= item.total_score && item.total_score <= scoreRanges.D.score_max).length
	const f_students_count = examTypeData.filter(item => scoreRanges.F.score_min <= item.total_score && item.total_score <= scoreRanges.F.score_max).length

	counts[main_school_name][level2_key1_name] = ((a_students_count + b_students_count) * 100) / students_count
	counts[main_school_name][level2_key2_name] = ((a_students_count + b_students_count + c_students_count) * 100) / students_count

	if (isNaN(counts[main_school_name][level2_key1_name])) counts[main_school_name][level2_key1_name] = 0
	if (isNaN(counts[main_school_name][level2_key2_name])) counts[main_school_name][level2_key2_name] = 0

	counts[main_school_name][level2_key1_name] = parseFloat(counts[main_school_name][level2_key1_name].toFixed(2))
	counts[main_school_name][level2_key2_name] = parseFloat(counts[main_school_name][level2_key2_name].toFixed(2))

	const mainSchoolData = {
		[main_school_name]: {
			[level2_key1_name]: counts[main_school_name][level2_key1_name],
			[level2_key2_name]: counts[main_school_name][level2_key2_name],
			all: students_count,
			a: a_students_count,
			b: b_students_count,
			c: c_students_count,
			d: d_students_count,
			f: f_students_count,
		}
	}

	const { counts: subSchoolChartData, subSchoolData } = getSubSchoolData(examTypeData, level1_key1, level2_key1, level2_key2, scoreRanges)
	const { counts: groupLevelChartData } = getSubSchoolData(examTypeData, level1_key2, level2_key1, level2_key2, scoreRanges)

	return (
		<>
			<ChartByAnyField
				isLoading={isLoading}
				subSchoolChartData={subSchoolChartData}
				mainSchoolData={counts}
				level2_key1={level2_key1}
				level2_key2={level2_key2}
				level1_key={level1_key1}
				chartTitle={'Бүрэлдэхүүн сургууль, институт'}
			/>
			<TableBySchool isLoading={isLoading} subSchoolData={subSchoolData} mainSchoolData={mainSchoolData} />
			<ChartByAnyField
				isLoading={isLoading}
				subSchoolChartData={groupLevelChartData}
				mainSchoolData={counts}
				level2_key1={level2_key1}
				level2_key2={level2_key2}
				level1_key={level1_key2}
				chartTitle={'Дамжаа (Их сургууль)'}
			/>
			<TableByClass scoreRanges={scoreRanges} isLoading={isLoading} examTypeData={examTypeData} level2_key1={level2_key1} level2_key2={level2_key2} />
		</>
	)
}

function getSubSchoolData(data, level1_key, level2_key1, level2_key2, scoreRanges) {
	const level1_key_name = level1_key[0]
	const level2_key1_name = level2_key1[0]
	const level2_key2_name = level2_key2[0]
	const subSchoolData = {}

	const counts = data.reduce((acc, student) => {
		const level1_key_value = student[level1_key_name]

		if (!acc[level1_key_value]) {
			acc[level1_key_value] = { [level2_key1_name]: 0, [level2_key2_name]: 0 }
			const level1KeyData = data.filter(item => item[level1_key_name] === level1_key_value)

			const students_count = level1KeyData.length
			const a_students_count = level1KeyData.filter(item => scoreRanges.A.score_min <= item.total_score && item.total_score <= scoreRanges.A.score_max).length
			const b_students_count = level1KeyData.filter(item => scoreRanges.B.score_min <= item.total_score && item.total_score <= scoreRanges.B.score_max).length
			const c_students_count = level1KeyData.filter(item => scoreRanges.C.score_min <= item.total_score && item.total_score <= scoreRanges.C.score_max).length
			const d_students_count = level1KeyData.filter(item => scoreRanges.D.score_min <= item.total_score && item.total_score <= scoreRanges.D.score_max).length
			const f_students_count = level1KeyData.filter(item => scoreRanges.F.score_min <= item.total_score && item.total_score <= scoreRanges.F.score_max).length

			acc[level1_key_value][level2_key1_name] = ((a_students_count + b_students_count) * 100) / students_count
			acc[level1_key_value][level2_key2_name] = ((a_students_count + b_students_count + c_students_count) * 100) / students_count

			if (isNaN(acc[level1_key_value][level2_key1_name])) acc[level1_key_value][level2_key1_name] = 0
			if (isNaN(acc[level1_key_value][level2_key2_name])) acc[level1_key_value][level2_key2_name] = 0

			acc[level1_key_value][level2_key1_name] = parseFloat(acc[level1_key_value][level2_key1_name].toFixed(2))
			acc[level1_key_value][level2_key2_name] = parseFloat(acc[level1_key_value][level2_key2_name].toFixed(2))

			subSchoolData[level1_key_value] = {
				[level2_key1_name]: acc[level1_key_value][level2_key1_name],
				[level2_key2_name]: acc[level1_key_value][level2_key2_name],
				all: students_count,
				a: a_students_count,
				b: b_students_count,
				c: c_students_count,
				d: d_students_count,
				f: f_students_count,
			}
		}

		return acc;
	}, {});

	return { counts, subSchoolData }
}

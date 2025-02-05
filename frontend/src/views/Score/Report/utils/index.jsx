import useApi from "@src/utility/hooks/useApi";
import useLoader from "@src/utility/hooks/useLoader";
import { useEffect, useState } from "react";

export default function useGeneralData() {
	const level2_key1 = ['quality', 'Чанар']
	const level2_key2 = ['success', 'Амжилт']
	const main_school_name = 'Их сургууль'

	const { isLoading, Loader, fetchData } = useLoader({})

	// api
	const teacherScoreReportApi = useApi().score.teacherScore
	const scoreListApi = useApi().settings.score

	// states
	const [datas, setDatas] = useState([])
	const [united_score_ranges, setUnitedScoreRanges] = useState(null)

	// to get united ranges without depending on sign "+" and duplicated assesment letters
	async function getUnitedScoreRanges() {
		const ranges = {}
		const { success, data } = await fetchData(scoreListApi.get())

		if (success) {
			for (let i = 0; i < data.length; i++) {
				const item = data[i]
				const assessment = item.assesment.replace('+', '')
				if (!ranges.hasOwnProperty(assessment)) ranges[assessment] = {}

				if (ranges[assessment].score_min) {
					if (ranges[assessment].score_min > item.score_min) {
						ranges[assessment].score_min = item.score_min
					}
				} else ranges[assessment]['score_min'] = item.score_min

				if (ranges[assessment].score_max) {
					if (ranges[assessment].score_max < item.score_max) {
						ranges[assessment].score_max = item.score_max
					}
				} else ranges[assessment]['score_max'] = item.score_max
			}
		}

		setUnitedScoreRanges(ranges)
	}

	async function getData() {
		const { success, data } = await fetchData(teacherScoreReportApi.getReportSchool())

		if (success) {
			setDatas(data)
		}
	}

	useEffect(() => {
		getUnitedScoreRanges()
	}, [])

	useEffect(() => {
		if (united_score_ranges) getData()
	}, [united_score_ranges])

	return { datas, united_score_ranges, isLoading, Loader, level2_key1, level2_key2, main_school_name }
}

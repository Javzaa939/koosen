import { Label, Col } from "reactstrap"
import Select from 'react-select'
import { useTranslation } from "react-i18next"
import { useEffect, useState } from "react"

import { ReactSelectStyles, generateLessonYear } from '@src/utility/Utils'
import useApi from "@src/utility/hooks/useApi"
import useLoader from "@src/utility/hooks/useLoader"


export default function ExamFilter({ setSelected, setSelectedYear, setSelectedSeason,  selected_season, selected_year}) {
	// states
	const [options, setOptions] = useState([])
	const [yearOption, setYear] = useState([])
	const [seasonOption, setSeasonOption] = useState([]);

	// primitive vars
	const controlName = 'exam'

	// other hooks
    const { t } = useTranslation()
    const challengeApi = useApi().challenge
    const seasonApi = useApi().settings.season;

    const { isLoading, fetchData } = useLoader({})

	async function getOptions() {
		const { success, data } = await fetchData(challengeApi.get(1, 10000000, '', '', '', '', true, selected_year, selected_season))

		if (success) {
			setOptions(data?.results)
		}
	}

	async function getSeasonOption() {
        const { success, data } = await fetchData(seasonApi.get());
        if (success) {
            setSeasonOption(data);
        }
    }

	useEffect(
		() => {
			setYear(generateLessonYear(10)),
			getSeasonOption()
		}, []
	)

	useEffect(
		() => {
			if(selected_season && selected_year) {
				getOptions()
			}
		}, [selected_season, selected_year]
	)

	return (
		<>
			<Col md={3} sm={12}>
				<Label className="form-label" for={'lesson_year'}>
					{t('Хичээлийн жил')}
				</Label>
				<Select
					id={'lesson_year'}
					name={'lesson_year'}
					isClearable
					classNamePrefix='select'
					className='react-select'
					placeholder={t(`-- Сонгоно уу --`)}
					options={yearOption || []}
					noOptionsMessage={() => t('Хоосон байна')}
					onChange={(val) => {
						setSelectedYear(val?.id || '')
					}}
					styles={ReactSelectStyles}
					getOptionValue={(option) => option.id}
					getOptionLabel={(option) => option.name}
					isLoading={isLoading}
				/>
			</Col>
			<Col md={3} sm={12}>
				<Label className="form-label" for={'lesson_season'}>
					{t('Хичээлийн улирал')}
				</Label>
				<Select
					id={'lesson_season'}
					name={'lesson_season'}
					isClearable
					classNamePrefix='select'
					className='react-select'
					placeholder={t(`-- Сонгоно уу --`)}
					options={seasonOption || []}
					noOptionsMessage={() => t('Хоосон байна')}
					onChange={(val) => {
						setSelectedSeason(val?.id || '')
					}}
					styles={ReactSelectStyles}
					getOptionValue={(option) => option.id}
					getOptionLabel={(option) => option.season_name}
					isLoading={isLoading}
				/>
			</Col>
			<Col md={3} sm={12}>
				<Label className="form-label" for={controlName}>
					{t('Шалгалт')}
				</Label>
				<Select
					id={controlName}
					name={controlName}
					isClearable
					classNamePrefix='select'
					className='react-select'
					placeholder={t(`-- Сонгоно уу --`)}
					options={options || []}
					noOptionsMessage={() => t('Хоосон байна')}
					onChange={(val) => {
						setSelected(val?.id || '')
					}}
					styles={ReactSelectStyles}
					getOptionValue={(option) => option.id}
					getOptionLabel={(option) => option.title}
					isLoading={isLoading}
				/>
			</Col>
		</>
	)
}
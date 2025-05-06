import Select from 'react-select';
import { ReactSelectStyles } from "@utils";
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import useLoader from '@src/utility/hooks/useLoader';

/**
 * @param getApi Example value: studentApi.get. Or if param 'isStaticOptions' is true then any "not promise" function
 * @param optionValueFieldName example value: 'id'
 * @param getOptionValue required structure: "(option) => ...". Example value: (option) => option.id
 * @param getOptionLabel required structure: "(option) => ...". Example value: (option) => `${option.code} ${option.last_name?.charAt(0)}. ${option.first_name}`
 */
export default function SimpleSelectFilter({
	fieldName,
	setParentSelectedOption,
	getApi,
	optionValueFieldName,
	getOptionValue,
	getOptionLabel,
	isMulti,
	isStaticOptions
}) {
	const { t } = useTranslation()
	const { isLoading, fetchData } = useLoader({})
	const [options, setOptions] = useState()

	async function getOptions() {
		if (isStaticOptions) setOptions(getApi())
		else {
			const { success, data } = await fetchData(getApi())
			if (success) setOptions(data)
		}
	}

	useEffect(() => {
		getOptions()
	}, [])

	return (
		<Select
			id={fieldName}
			name={fieldName}
			isClearable
			classNamePrefix='select'
			className='react-select'
			placeholder={t(`-- Сонгоно уу --`)}
			options={options || []}
			noOptionsMessage={() => t('Хоосон байна')}
			onChange={(val) => {
				let selectedOptions = ''

				if (val !== null) {
					if (isMulti) selectedOptions = (val?.map(item => item[optionValueFieldName]) || []).join(',')
					else selectedOptions = val[optionValueFieldName] || ''
				}

				setParentSelectedOption(selectedOptions)
			}}
			styles={ReactSelectStyles}
			isLoading={isLoading}
			getOptionValue={(option) => getOptionValue(option)}
			getOptionLabel={(option) => getOptionLabel(option)}
			isMulti={isMulti}
		/>
	)
}

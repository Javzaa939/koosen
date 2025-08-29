import Select from 'react-select';
import { ReactSelectStyles } from "@utils";
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import useLoader from '@src/utility/hooks/useLoader';

/**
 * @param getApi required structure (better wrap to useCallback to avoid redundant render's updating occurings): "(pageLocal, searchTextLocal, recordsLimitPerPageLocal) => ...". Example value: (pageLocal, searchTextLocal, recordsLimitPerPageLocal) => studentApi.get(recordsLimitPerPageLocal, pageLocal, '', searchTextLocal)
 * @param getOptionValue required structure: "(option) => ...". Example value: (option) => option.id
 * @param getOptionLabel required structure: "(option) => ...". Example value: (option) => `${option.code} ${option.last_name?.charAt(0)}. ${option.first_name}`
 * @param optionValueFieldName required. Example: optionValueFieldName={'id'}
 * @param value required. Example: "value={idVariable}" or if isMulti: "value={idVariableArray}"
 * * if Controller used then e.g.:
 * * - exclude ref field from controller 'field/rest' object. E.g.: render={({ field: { ref, ...rest } }) => {
 */
export default function ScrollSelectFilterById({
	fieldName,
	getApi,
	getOptionValue,
	getOptionLabel,
	isMulti,
	className='react-select',
	recordsLimitPerPage=15,
	onChange,
	optionValueFieldName,
	value,
	staticOptions,
	...rest
}) {
	const { t } = useTranslation()
	const { isLoading, fetchData } = useLoader({})
	const [options, setOptions] = useState([])

	async function getOptions(pageLocal) {
		if (staticOptions) {
			setOptions(staticOptions)
			return
		}
		if (pageLocal === 1 || pageLocal <= totalPages) {
			const { success, data } = await fetchData(getApi(pageLocal, searchText ?? '', recordsLimitPerPage))

			if (success) {
				if (pageLocal === 1) {
					setOptions(data?.results)
					setPage(1)
				} else {
					// scrolling
					setOptions((prev) => [...prev, ...data?.results])
				}

				setTotalPages(Math.ceil(data?.count / recordsLimitPerPage))
			}
		}
	}

	// #region scrolling
	const [page, setPage] = useState(1)

	useEffect(() => {
		getOptions(page)
	}, [page])
	// #endregion

	// #region searching
	const [searchText, setSearchText] = useState()

	// to update actual count after filters. e.g. searching. To stop getting data after reaching end of records, otherwise record will be duplicated
	const [totalPages, setTotalPages] = useState()

	useEffect(() => {
		if (searchText !== undefined) {
			const timeoutId = setTimeout(() => {
				getOptions(1)
			}, 1000);

			return () => {
				clearTimeout(timeoutId)
			}
		}
	}, [searchText])
	// #endregion

	useEffect(() => {
		getOptions(1)
	}, [getApi])

	return (
		<Select
			{...rest}
			id={fieldName}
			name={fieldName}
			isClearable
			classNamePrefix='select'
			className={className}
			placeholder={t(`-- Сонгоно уу --`)}
			options={options || []}
			noOptionsMessage={() => t('Хоосон байна')}
			onChange={onChange}
			styles={ReactSelectStyles}
			isLoading={isLoading}
			getOptionValue={getOptionValue}
			getOptionLabel={getOptionLabel}
			isMulti={isMulti}
			value={(() => {
				let returnValue = ''

				if (value) {
					if (isMulti) {
						returnValue = options.filter((c) => value.includes(c[optionValueFieldName]))
					} else {
						returnValue = options.find((c) => c[optionValueFieldName] === value)
					}
				}

				return returnValue
			})()}

			// scrolling
			onMenuScrollToBottom={() => {
				if (page + 1 <= totalPages) setPage(page + 1)
			}}

			// searching
			onInputChange={(text) => {
				setSearchText(text)
			}}
		/>
	)
}

export const onChangeFile = (e, setImageOld) => {
	const reader = new FileReader()
	const files = e.target.files

	if (files.length > 0) {
		reader.onload = function () {
			setImageOld(reader.result)
		}
		reader.readAsDataURL(files[0])
	}
}

// OnlineSubInfo file_type choices
export const PDF = 1
export const VIDEO = 2
export const TEXT = 3
export const AUDIO = 4
export const QUIZ = 5

// QuezQuestions kind choices
export const KIND_ONE_CHOICE = 1
export const KIND_MULTI_CHOICE = 2
export const KIND_BOOLEAN = 3
export const KIND_RATING = 4
export const KIND_TEXT = 5
export const KIND_SHORT_CHOICE = 6
export const KIND_JISHIH_CHOICE = 7
export const KIND_ESTIMATE_CHOICE = 8
export const KIND_PROJECT_CHOICE = 9
export const KIND_TOVCH_CHOICE = 10

export function nullifyLackFields(dictData, fields) {
	fields.forEach(field => {
		if (!Object.prototype.hasOwnProperty.call(dictData, field))
			dictData[field] = null
	})

	return dictData
}

export function getOnlySpecifiedFields(allFieldsDict, gettingFieldNames) {
	return Object.fromEntries(
		Object.entries(allFieldsDict).filter(([key]) => gettingFieldNames.includes(key))
	)
}
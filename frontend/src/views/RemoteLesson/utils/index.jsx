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

export const PDF = 1
export const VIDEO = 2
export const TEXT = 3
export const AUDIO = 4
export const QUIZ = 5
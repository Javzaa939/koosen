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
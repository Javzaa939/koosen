import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	answer: Yup.string()
		.trim()
		.required('Хоосон байна'),
	request_flag: Yup.string()
		.trim()
		.required('Хоосон байна'),
});

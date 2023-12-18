import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	group_code: Yup.string()
		.trim()
		.required('Хоосон байна'),
	group_name: Yup.string()
		.trim()
		.required('Хоосон байна'),
});

import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	degree_code: Yup.string()
		.trim()
		.required('Хоосон байна'),
	degree_name: Yup.string()
		.trim()
		.required('Хоосон байна'),
});

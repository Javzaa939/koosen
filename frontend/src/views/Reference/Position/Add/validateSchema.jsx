import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
    org: Yup.string()
		.trim()
		.required('Хоосон байна'),
	name: Yup.string()
		.trim()
		.required('Хоосон байна'),
	description: Yup.string()
		.trim()
		.required('Хоосон байна'),
});

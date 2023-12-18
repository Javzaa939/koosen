import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	name: Yup.string()
		.trim()
		.required('Хоосон байна'),
	type: Yup.string()
		.trim()
		.required('Хоосон байна'),
	leader: Yup.string()
		.trim()
		.required('Хоосон байна'),
});

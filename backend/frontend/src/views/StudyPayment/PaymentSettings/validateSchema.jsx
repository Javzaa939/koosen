import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	group: Yup.string()
		.trim()
		.required('Хоосон байна'),
    payment: Yup.string()
		.trim()
		.required('Хоосон байна'),
});

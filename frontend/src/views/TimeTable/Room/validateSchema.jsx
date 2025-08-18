import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	building: Yup.string()
		.trim()
		.required('Хоосон байна'),
	code: Yup.string()
		.trim()
		.required('Хоосон байна'),
    type: Yup.string()
		.trim()
		.required('Хоосон байна'),
});

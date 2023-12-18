import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	lesson: Yup.string()
		.trim()
		.required('Хоосон байна'),
	teacher: Yup.string()
		.trim()
		.required('Хоосон байна'),
	type: Yup.string()
        .trim()
        .required('Хоосон байна'),
});

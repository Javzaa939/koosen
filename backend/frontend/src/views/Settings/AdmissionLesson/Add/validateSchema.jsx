import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	lesson_code: Yup.string()
		.trim()
		.required('Хоосон байна'),
    lesson_name: Yup.string()
		.trim()
		.required('Хоосон байна'),
});

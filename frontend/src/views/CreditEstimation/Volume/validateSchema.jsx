import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	lesson: Yup.number()
		.required('Хоосон байна'),
	teacher: Yup.number()
		.required('Хоосон байна'),
	type: Yup.number()
        .required('Хоосон байна'),
});

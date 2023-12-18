import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	discount: Yup.string()
		.trim()
		.required('Хоосон байна'),
	student: Yup.string()
		.trim()
		.required('Хоосон байна'),
	stipent_type: Yup.string()
		.trim()
		.required('Хоосон байна'),
});

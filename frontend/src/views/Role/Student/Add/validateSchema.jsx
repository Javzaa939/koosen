import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	student: Yup.string()
		.trim()
		.required('Хоосон байна'),
	description: Yup.string()
		.trim()
		.required('Хоосон байна'),
	// start_date: Yup.string()
	// 	.required('Хоосон байна'),

	// finish_date: Yup.string()
	// 	.trim()
	// 	.required('Хоосон байна'),
});

import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	// start_date: Yup.string()
	// 	.trim()
	// 	.required('Хоосон байна'),
	// finish_date: Yup.string()
	// 	.trim()
	// 	.required('Хоосон байна'),
	teacher: Yup.string()
		.trim()
		.required('Хоосон байна'),
	lesson: Yup.string()
		.trim()
		.required('Хоосон байна'),
	score_type: Yup.string()
		.trim()
		.required('Хоосон байна'),
	description: Yup.string()
		.trim()
		.required('Хоосон байна'),


});

import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	// admission_lesson: Yup.string()
	// 	.trim()
	// 	.required('Хоосон байна'),
    bottom_score: Yup.string()
		.trim()
		.required('Хоосон байна'),
});

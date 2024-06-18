import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	score_type: Yup.string()
		.trim()
		.required('Хоосон байна'),
    bottom_score: Yup.string()
		.trim()
		.required('Хоосон байна'),
});

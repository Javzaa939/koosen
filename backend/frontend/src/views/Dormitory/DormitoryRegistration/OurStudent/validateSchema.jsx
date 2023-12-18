import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	solved_flag: Yup.string()
		.trim()
		.required('Хоосон байна'),
});

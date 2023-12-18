import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	permission_type: Yup.string()
		.trim()
		.required('Хоосон байна'),
	// start_date: Yup.string()
	// 	.trim()
	// 	.required('Хоосон байна'),
	// finish_date: Yup.string()
	// 	.trim()
	// 	.required('Хоосон байна'),

});

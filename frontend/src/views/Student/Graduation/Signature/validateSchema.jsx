import * as Yup from 'yup';

export const validateSchema = Yup.object().shape(
{
	last_name: Yup
		.string()
		.trim()
		.required('Хоосон байна'),

    first_name: Yup
		.string()
		.trim()
		.required('Хоосон байна'),

    position_name: Yup
		.string()
		.trim()
		.required('Хоосон байна'),

	last_name_eng: Yup
		.string()
		.trim()
		.required('Хоосон байна'),

    first_name_eng: Yup
		.string()
		.trim()
		.required('Хоосон байна'),

    position_name_eng: Yup
		.string()
		.trim()
		.required('Хоосон байна'),

	// last_name_uig: Yup
	// 	.string()
	// 	.trim()
	// 	.required('Хоосон байна'),

    // first_name_uig: Yup
	// 	.string()
	// 	.trim()
	// 	.required('Хоосон байна'),

    // position_name_uig: Yup
	// 	.string()
	// 	.trim()
	// 	.required('Хоосон байна'),

});

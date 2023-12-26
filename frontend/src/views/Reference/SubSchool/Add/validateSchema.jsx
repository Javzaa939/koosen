import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	name: Yup.string()
		.trim()
		.required('Хоосон байна'),
    name_eng: Yup.string()
		.trim()
		.required('Хоосон байна'),
    name_uig: Yup.string()
		.trim()
		.required('Хоосон байна'),
    zahiral_name: Yup.string()
		.trim()
		.required('Хоосон байна'),
    zahiral_name_eng: Yup.string()
		.trim()
		.required('Хоосон байна'),
    zahiral_name_uig: Yup.string()
		.trim()
		.required('Хоосон байна'),
    tsol_name: Yup.string()
		.trim()
		.required('Хоосон байна'),
    tsol_name_eng: Yup.string()
		.trim()
		.required('Хоосон байна'),
    tsol_name_uig: Yup.string()
		.trim()
		.required('Хоосон байна'),

	erdem_tsol_name: Yup.string()
		.trim()
		.required('Хоосон байна'),
    erdem_tsol_name_eng: Yup.string()
		.trim()
		.required('Хоосон байна'),
    erdem_tsol_name_uig: Yup.string()
		.trim()
		.required('Хоосон байна'),
});

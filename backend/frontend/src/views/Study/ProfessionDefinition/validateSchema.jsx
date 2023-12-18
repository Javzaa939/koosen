import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	code: Yup.string()
		.trim()
		.required('Хоосон байна'),
	name: Yup.string()
		.trim()
		.required('Хоосон байна'),
    dep_name: Yup.string()
		.trim()
		.required('Хоосон байна'),
	degree: Yup.string()
		.trim()
		.required('Хоосон байна'),
	department: Yup.string()
		.trim()
		.required('Хоосон байна'),
	gen_direct_type: Yup.string()
		.trim()
		.required('Хоосон байна') ,
    confirm_year: Yup.string()
        .max(4, 'Зөв утга оруулна уу.')
		.nullable()
        .matches(/[1-9]{1}[0-9]{3}/, {
			excludeEmptyString: true,
			message: 'Зөв утга оруулна уу.',
        })
		.required('Хоосон байна')
        .transform(value => (isNaN(value) ? undefined : value))
});

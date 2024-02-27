import * as Yup from 'yup'

export const validateSchema = Yup.object().shape({
    email: Yup.string()
        .required('Имейлээ оруулна уу'),
    address: Yup.string()
		.required('Хаяг оруулна уу'),
    jijvvr_mobile: Yup.string()
		.required('Хоосон байна'),
    mobile: Yup.string()
		.required('Хоосон байна'),
    contact_mobile: Yup.string()
		.required('Хоосон байна'),
    admission_juram: Yup.string()
		.required('Хоосон байна'),
    admission_advice: Yup.string()
        .required('Хоосон байна'),
    home_description: Yup.string()
        .required('Хоосон байна'),
})


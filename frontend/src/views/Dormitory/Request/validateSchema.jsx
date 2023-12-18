import * as Yup from 'yup'

export const validateSchema = Yup.object().shape(
    {
        name: Yup.string()
            .trim()
            .required('Хоосон байна'),
        amount: Yup.string()
            .trim()
            .required('Хоосон байна'),
        description: Yup.string()
            .trim()
            .required('Хоосон байна'),
        deadline: Yup.string()
            .trim()
            .required('Хоосон байна'),
    });

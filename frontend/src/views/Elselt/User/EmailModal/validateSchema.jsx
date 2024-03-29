import * as Yup from 'yup'

export const validateSchema = Yup.object().shape({
    description: Yup.string()
        .trim()
        .required('Тайлбар оруулна уу.')
});

import * as Yup from 'yup'

export const validateSchema = Yup.object().shape({
    justice_state: Yup.string()
        .trim()
        .required('Төлөв сонгоно уу.')
});

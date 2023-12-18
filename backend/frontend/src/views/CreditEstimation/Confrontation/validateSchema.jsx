import * as Yup from 'yup'

export const validateSchema = Yup.object().shape(
{
    profession: Yup.string()
        .trim()
        .required('Та заавал сонгоно уу'),
});

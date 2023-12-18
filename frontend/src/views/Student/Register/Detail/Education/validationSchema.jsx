import * as Yup from 'yup';
import { t } from 'i18next';

export const validateSchema = Yup.object().shape({
    edu_level: Yup.string()
        .trim()
        .required(t('Хоосон байна')),
    // join_year: Yup.string().required("Огноог оруулна уу"),
    // graduate_year: Yup
    //     .mixed()
    //     .test(
    //         "hoosn", "огноог оруулна уу", (value, context) => {
    //             return value
    //         })
    //     .test(
    //         "min", "Элссэн оноос их утга оруулна уу", (value, context) => {
    //             return new Date(value) > new Date(context?.parent?.join_year)
    //         },
    //     ),
    // profession: Yup.string()
    //     .trim()
    //     .required(t('Хоосон байна')),
    certificate_num: Yup.string()
        .trim()
        .required(t('Хоосон байна')),
})


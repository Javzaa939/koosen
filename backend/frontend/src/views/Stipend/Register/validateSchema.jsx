import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
    stipend_type: Yup.string()
        .trim()
        .required('Хоосон байна.'),
    start_date: Yup.string()
        .trim()
        .required('Хоосон байна.'),
    finish_date: Yup.mixed()
    .test(
        "hoosn", "Хоосон байна", (value, context) => {
            return value
        })
    .test(
        "min", "Эхлэх хугацаанаас их байх ёстой", (value, context) => {
            return value > context?.parent?.start_date
        },
        )
});

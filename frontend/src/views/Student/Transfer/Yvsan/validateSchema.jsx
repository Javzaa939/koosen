import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
    // statement_date: Yup.string()
    //     .trim()
    //     .required('Хоосон байна.'),
    // statement: Yup.string()
    //     .trim()
    //     .required('Хоосон байна.'),
    student: Yup.string()
        .trim()
        .required('Хоосон байна.'),
    destination_group: Yup.mixed().nullable().test('check',
        'Хоосон байна',
        (val, context) => {
            if (context.parent.is_internal)
            {
                if (!context.parent.destination_group)
                {
                    return false
                }
                return true
            }
            else
            {
                return true
            }
        })
});

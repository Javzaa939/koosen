import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	begin_date: Yup.string()
		.trim()
		.required('Хоосон байна'),
    // teacher: Yup.string()
    //     .trim()
	// 	.required('Хоосон байна'),
	// room: Yup.string()
    //     .trim()
	// 	.test('required', 'Хоосон байна', val => {
	// 		if(document.getElementById('is_online').checked) return true
	// 		else return val
	// 	}),
	lesson: Yup.string()
        .trim()
		.required('Хоосон байна'),
	end_date: Yup
        .mixed()
        .test(
            "hoosn", "Хоосон байна", (value, context) => {
                return value
            })
        .test(
            "min", "Эхлэх цагаас их байх ёстой", (value, context) => {
                return value > context?.parent?.begin_date
            },
        )
});

import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	solved_flag: Yup.string()
		.trim()
		.required('Хоосон байна'),
	solved_start_date: Yup.string()
        .trim()
		.test('required', 'Хоосон байна', (val, context) => {
			if(context?.parent?.solved_flag && context?.parent?.solved_flag == 4) return val
			else return true
		}),
	solved_finish_date: Yup.string()
		.trim()
		.test('required', 'Хоосон байна', (val, context) => {
			if(context?.parent?.solved_flag && context?.parent?.solved_flag == 4) return val
			else return true
		}),
});

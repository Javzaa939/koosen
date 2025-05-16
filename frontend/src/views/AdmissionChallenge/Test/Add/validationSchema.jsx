import * as Yup from "yup";

export const validateSchema = Yup.object().shape({
	title: Yup.string().trim().required("Хоосон байна"),
	description: Yup.string().trim().required("Хоосон байна"),
	lesson: Yup.string().trim().required("Та хичээлээ заавал сонгоно уу."),
	duration: Yup.string().trim().required("Хоосон байна"),
});
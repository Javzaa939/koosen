import * as Yup from "yup";

export const validatePassSchema = Yup.object().shape({
	old_password: Yup.string().trim().required("Хоосон байна"),
    password: Yup.string().required("Нууц үг оруулна уу"),
	confirm_password: Yup.string().oneOf([Yup.ref("password"), null], "Нууц үгүүд ижил биш байна").required().max(80),
});

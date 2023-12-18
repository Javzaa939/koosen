// ** React Imports
import { Link, useNavigate, useParams } from "react-router-dom"

// ** Custom Hooks
import { useSkin } from "@hooks/useSkin"

// ** Icons Imports
import { ChevronLeft } from "react-feather"

import {useForm, Controller } from "react-hook-form"

import InputPasswordToggle from "@components/input-password-toggle"

// ** Reactstrap Imports
import {
  Row,
  Col,
  Form,
  Label,
  Button,
  CardTitle,
  FormFeedback,
} from "reactstrap"

// ** Styles
import "@styles/react/pages/page-authentication.scss"

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import * as Yup from 'yup'
import { validate } from "@utils"

const providerSchema = Yup.object().shape({
    password: Yup.string().required("Нууц үг оруулна уу"),
    confirm_password: Yup.string().oneOf([Yup.ref("password"), null], "Нууц үг адил биш байна.").required('Нууц үгээ давтан оруулна уу.').max(80),
});

const NewPassword = () => {
    // ** Hooks
    const { skin } = useSkin()
    const navigate = useNavigate()

    const { token } = useParams()
    const userApi = useApi().user
    const { fetchData } = useLoader({})

    const { control, formState: { errors }, handleSubmit } = useForm(validate(providerSchema))

    const illustration =
        skin === "dark" ? "forgot-password-v2-dark.svg" : "forgot-password-v2.svg",
        source = require(`@src/assets/images/pages/${illustration}`).default
        const logo = require("@src/assets/images/logo/logo-muis.png").default

        async function onSubmit(datas) {
        const cdata = {
            password: datas.password
        }

        const { success } = await fetchData(userApi.new_user_password(token, cdata))
        if (success) {
            navigate("/login")
        }
    }

    return (
        <div className="auth-wrapper auth-cover">
            <Row className="auth-inner m-0">
                <Link className="brand-logo" to="/" onClick={(e) => e.preventDefault()}>
                    <img src={logo} alt="logo" style={{objectFit: 'cover'}} width={40} height={40}/>
                    <h2 className="brand-text text-primary ms-1 pt-1">Сургалтын удирдлагын систем</h2>
                </Link>
                <Col className="d-none d-lg-flex align-items-center p-5" lg="8" sm="12">
                    <div className="w-100 d-lg-flex align-items-center justify-content-center px-5">
                        <img className="img-fluid" src={source} alt="Login Cover" />
                    </div>
                </Col>
                <Col
                    className="d-flex align-items-center auth-bg px-2 p-lg-5"
                    lg="4"
                    sm="12"
                >
                    <Col className="px-xl-2 mx-auto" sm="8" md="6" lg="12">
                        <CardTitle tag="h2" className="fw-bold mb-1">
                            Нууц үг тохируулах 🔒
                        </CardTitle>
                        <Form
                            className="auth-forgot-password-form mt-2"
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            <Row>
                                <Col className="mb-1" xs={12} md={12}>
                                    <Label className="form-label" for="register-password">
                                        Нууц үг
                                    </Label>
                                    <Controller
                                        defaultValue=''
                                        control={control}
                                        id='password'
                                        name='password'
                                        render={({ field }) => <InputPasswordToggle className="input-group-merge" invalid={errors.password && true} {...field}/>}
                                    />
                                    {errors.password && <FormFeedback>{errors.password.message}</FormFeedback>}
                                </Col>
                                <Col xs={12} md={12}>
                                    <Label className="form-label" for="confirm-password">
                                        Нууц үгээ давтана уу
                                    </Label>
                                    <Controller
                                        defaultValue=''
                                        control={control}
                                        id='confirm_password'
                                        name='confirm_password'
                                        render={({ field }) => <InputPasswordToggle className="input-group-merge" invalid={errors.confirm_password && true} {...field}/>}
                                    />
                                    {errors.confirm_password && <FormFeedback>{errors.confirm_password.message}</FormFeedback>}
                                </Col>
                            </Row>
                            <Col className="d-flex justify-content-start mx-0 mt-1 ps-0" xs={12}>
                                <Button className="mt-1 me-1" color="primary" type="submit" block >
                                    Хадгалах
                                </Button>
                            </Col>
                        </Form>
                        <p className="text-center mt-2">
                            <Link to="/login">
                                <ChevronLeft className="rotate-rtl me-25" size={14} />
                                <span className="align-middle">Нэвтрэх хэсэг рүү буцах</span>
                            </Link>
                        </p>
                    </Col>
                </Col>
            </Row>
        </div>
    )
}

export default NewPassword

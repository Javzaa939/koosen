import { useContext, useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'

// ** React Imports
import { Link } from "react-router-dom"

// ** Custom Hooks
import { useSkin } from "@hooks/useSkin"

// ** Icons Imports
import { ChevronLeft } from "react-feather"

// ** Reactstrap Imports
import {
  Row,
  Col,
  Form,
  Label,
  Input,
  Button,
  Spinner,
  CardText,
  CardTitle,
  FormFeedback,
} from "reactstrap"

// ** Styles
import "@styles/react/pages/page-authentication.scss"

import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useNavigate } from "react-router-dom"

// hooks imports
import useApi from "@hooks/useApi"
import useLoader from "@hooks/useLoader"

import { validate} from "@utils"
import AuthContext from '@context/AuthContext'

const validateSchema = yup.object().shape({
    email: yup.string().email("И-мэйл хаяг алдаатай байна").required('И-мэйл хаяг оруулна уу'),
})


const ForgotPassword = () => {
    // ** Hooks
    const { skin } = useSkin()
    const { user } = useContext(AuthContext)
	const navigate = useNavigate()

	useEffect(() => {
		if(user.id){
			navigate(`/calendar`)
		}
	},[])

    const {
        control,
        handleSubmit,
        formState: { errors }
    } = useForm(validate(validateSchema))

    const userApi = useApi().user
    const { fetchData } = useLoader({})

    const illustration = skin === "dark" ? "forgot-password-v2-dark.svg" : "forgot-password-v2.svg"
    const source = require(`@src/assets/images/pages/${illustration}`).default
    const logo = require("@src/assets/images/logo/logo-muis.png").default

    const [is_loading, setIsLoading] = useState(false)


    async function onSubmit (datas) {
        setIsLoading(true)
        const { success } = await fetchData(userApi.forgotPassword(datas))

        setIsLoading(false)
    }

    return (
        <div className="auth-wrapper auth-cover">
            {
                is_loading &&
                <div className='suspense-loader'>
                    <Spinner size='bg'/>
                    <span className='ms-50'>Түр хүлээнэ үү...</span>
                </div>
            }
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
                            Нууц үгээ мартсан уу? 🔒
                        </CardTitle>
                        <CardText className="mb-2">
                            Та и-мэйл хаягаа оруулна уу. Бид нууц үг сэргээх холбоосыг таны и-мэйлээр илгээх болно.
                        </CardText>
                        <Form
                            className="auth-forgot-password-form mt-2"
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            <div className="mb-1">
                                <Label className="form-label" for="login-email">
                                    И-мэйл
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id='email'
                                    name='email'
                                    render={({ field }) =>
                                        <Input id="email" placeholder='И-мэйл хаяг' invalid={errors.email && true} {...field}
                                    />}
                                />
                                {errors.email && <FormFeedback className="d-block">{errors.email.message}</FormFeedback>}
                            </div>
                            <Button color="primary" block>
                                И-мэйл илгээх
                            </Button>
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

export default ForgotPassword

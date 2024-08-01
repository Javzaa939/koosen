// ** React Imports
import { Link, useNavigate } from "react-router-dom"
import { useState } from 'react'

// ** Custom Hooks
import { useSkin } from "@hooks/useSkin"
import useApi from "@hooks/useApi"
import useLoader from "@hooks/useLoader"

// ** Icons Imports
import { ChevronLeft } from "react-feather"


import {useForm, Controller } from "react-hook-form"
import { useLocation } from 'react-router-dom'

import InputPasswordToggle from "@components/input-password-toggle"

import { validate } from "@utils"
import * as yup from 'yup'

// ** Reactstrap Imports
import {
  Row,
  Col,
  Form,
  Label,
  Button,
  CardText,
  CardTitle,
  Spinner,
  FormFeedback
} from "reactstrap"

// ** Styles
import "@styles/react/pages/page-authentication.scss"

const passwordSchema = yup.object().shape({
  password: yup.string()
  .min(8, 'Password must be at least 8 characters')
  .max(20, 'Password must be at most 20 characters')
  .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
  .matches(/[0-9]/, 'Password must contain at least one number')
  .matches(/[\W_]/, 'Password must contain at least one special character')
  .required('Password is required')
})

const ResetPassword = () => {
  // ** Hooks
  const { skin } = useSkin()

  const userApi = useApi().user

  const { control, handleSubmit, formState: { errors }} = useForm(validate(passwordSchema))

  const { fetchData } = useLoader({})

  const [is_loading, setIsLoading] = useState(false)

	const navigate = useNavigate()

  const logo = require("@src/assets/images/logo/dxis_logo.png").default

  const illustration =
    skin === "dark" ? "forgot-password-v2-dark.svg" : "forgot-password-v2.svg",
    source = require(`@src/assets/images/pages/${illustration}`).default


  async function onSubmit (datas) {
    setIsLoading(true)
    const { success } = await fetchData(userApi.forgotPasswordConfirm(datas))
    setIsLoading(false)
    if (success) {
      navigate("/login")
    }
  }

  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const token = query.get('token');

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
              Нууц үг сэргээх 🔒
            </CardTitle>
            <CardText className="mb-2">
              Таны шинэ нууц үг нь өмнөх нууц үгээс ялгаатай байх ёстой.
            </CardText>
            <Form
              className="auth-forgot-password-form mt-2"
              onSubmit={handleSubmit(onSubmit)}
            >
                <Controller
                  defaultValue={token}
                  control={control}
                  id='token'
                  name='token'
                  render={({ field }) => <input type="hidden" {...field} />}
                />
                <Row >
                    <Col xs={12} md={12}>
                    <Label className="form-label" for="register-password">
                        Шинэ нууц үг
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

export default ResetPassword

// ** React Imports
import { Link, useNavigate } from "react-router-dom"

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
  CardText,
  CardTitle,
} from "reactstrap"

// ** Styles
import "@styles/react/pages/page-authentication.scss"

const ForgotPassword = () => {
  // ** Hooks
  const { skin } = useSkin()

  const { control, formState: { errors }} = useForm()

  const logo = require("@src/assets/images/logo/logo-muis.png").default

  const illustration =
    skin === "dark" ? "forgot-password-v2-dark.svg" : "forgot-password-v2.svg",
    source = require(`@src/assets/images/pages/${illustration}`).default

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
              Нууц үг сэргээх 🔒
            </CardTitle>
            <CardText className="mb-2">
              Таны шинэ нууц үг нь өмнөх нууц үгээс ялгаатай байх ёстой.
            </CardText>
            <Form
              className="auth-forgot-password-form mt-2"
              onSubmit={(e) => e.preventDefault()}
            >
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

export default ForgotPassword

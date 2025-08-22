// ** React Imports
import { Link } from "react-router-dom"

// ** Reactstrap Imports

// ** Custom Hooks
import { useSkin } from "@hooks/useSkin"

// ** Styles
import "@styles/base/pages/page-misc.scss"

import logo from "@src/assets/images/logo/dxis_logo.png"

const Error = () => {
    // ** Hooks
    const { skin } = useSkin()

    const illustration = skin === "dark" ? "error-dark.svg" : "error.svg",
    source = require(`@src/assets/images/pages/${illustration}`).default
    return (
        <div className="misc-wrapper">
            <a className="brand-logo" href="/">
                <img src={logo} alt="logo" style={{objectFit: 'cover'}} width={40} height={40}/>
                <h2 className="brand-text text-primary ms-1 mt-50">Сургалтын удирдлагын систем</h2>
            </a>
            <div className="misc-inner p-2 p-sm-3">
                <div className="w-100 text-center">
                    <h2 className="mb-1">Хуудас олдсонгүй 🕵🏻‍♀️</h2>
                    <p className="mb-2">
                        Oops! 😖 хүссэн URL энэ серверээс олдсонгүй.
                    </p>
                    <Button
                        tag={Link}
                        to="/"
                        color="primary"
                        className="btn-sm-block mb-2"
                    >
                        Нүүр хуудас руу буцах
                    </Button>
                    <img className="img-fluid" src={source} alt="Not authorized page" />
                </div>
            </div>
        </div>
    )
}
export default Error

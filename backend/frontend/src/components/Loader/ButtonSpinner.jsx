import React from 'react'

const ButtonSpinner = ({ className }) => {
    return (
        <i className={`fas fa-spinner-third fa-spin me-2 ${className ? className : ""}`}></i>
    )
}

export default ButtonSpinner

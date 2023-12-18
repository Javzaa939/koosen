import React, { useState } from "react";
import { AlertCircle } from "react-feather";
import { Badge } from "reactstrap";

function Blank({ text, color }){

    const recievedText = text && text.length > 0 ? text : 'Хийгдэж байгаа'

    const colorList = [
        'danger',
        'warning',
        'info',
        'primary',
        'success',
        'dark'
    ]
    const colorProps = color && colorList.includes(color) ? 'light-' + color : 'light-info'

    return(
        <div className="d-flex justify-content-center p-5">
            <Badge color={colorProps} className="p-1"> <AlertCircle/> {recievedText}</Badge>
        </div>
    )
}

export default Blank
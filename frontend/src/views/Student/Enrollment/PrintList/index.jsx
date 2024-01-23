import React from 'react'
import { useLocation } from 'react-router-dom'

function PrintList() {
    const location = useLocation()
    console.log(location.state)

    return (
        <>
            print list
        </>
    )
}

export default PrintList
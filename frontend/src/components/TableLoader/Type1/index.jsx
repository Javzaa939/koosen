import React from 'react'
import { Spinner } from 'reactstrap'

function Type1({ skin }) {
    return (
        <div className='d-flex align-items-center justify-content-center' style={{ minHeight: 500 }}>
            {
                skin == 'light' ?
                <>
                    <Spinner className='me-50 mb-25' style={{ color: '#666666' }} size='sm'/><h5>Түр хүлээнэ үү...</h5>
                </>
                :
                <>
                    <Spinner className='me-50 mb-25' style={{ color: '#c4c4c4' }} size='sm'/><h5>Түр хүлээнэ үү...</h5>
                </>
            }
        </div>
    )
}

export default Type1

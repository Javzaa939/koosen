import { useSkin } from '@src/utility/hooks/useSkin'
import React from 'react'
import { Spinner } from 'reactstrap'

/**
 * Хүснэгтэд зориулсан
 * @param {Number} type Төрөл
 */
function TableLoader({
    type=1
}) {

    const { skin  } = useSkin()

    if(type === 1) {
        return (
            <div className='my-2 d-flex align-items-center justify-content-center' style={{ minHeight: 500 }}>
                {
                    skin == 'light' ?
                    <>
                        <Spinner className='me-50' style={{ color: '#666666' }} size='sm'/><h5>Түр хүлээнэ үү...</h5>
                    </>
                    :
                    <>
                        <Spinner className='me-1' color="" size='sm'/><h5>Түр хүлээнэ үү...</h5>
                    </>
                }
            </div>
        )
    }
}

export default TableLoader

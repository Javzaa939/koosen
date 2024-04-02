import { useSkin } from '@src/utility/hooks/useSkin'
import React from 'react'

/**
 * Хүснэгтэд зориулсан
 * @param {Number} type Төрөл
 */
function TableBlank({
    type=1
}) {

    if(type === 1) {
        return (
            <div className='d-flex align-items-center justify-content-center' style={{ minHeight: 500 }}>
                <h5>Өгөгдөл байхгүй байна</h5>
            </div>
        )
    }
}

export default TableBlank

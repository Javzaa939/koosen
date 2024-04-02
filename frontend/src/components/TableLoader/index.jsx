import { useSkin } from '@src/utility/hooks/useSkin'
import React from 'react'
import { Spinner } from 'reactstrap'
import Type1 from './Type1'

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
            <Type1 skin={skin}/>
        )
    }
}

export default TableLoader

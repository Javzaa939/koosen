import { useSkin } from '@src/utility/hooks/useSkin'

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

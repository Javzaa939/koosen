import { useEffect, useRef } from 'react'

function useUpdateEffect(effect, deps) {
    const isFirst = useRef(true);

    useEffect(() => {
        if (isFirst.current)
        {
            isFirst.current = false;
        }
        else
        {
            return effect()
        }
    }, deps)
}

export default useUpdateEffect
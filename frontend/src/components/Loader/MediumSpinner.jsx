import React, { useEffect, useRef } from 'react'

import styles from './style.module.css'

/**
 * Тодорхой хэсэгт унших loader
 * @param {boolean} absolute Html ийн өмнө гарч ирж уншдаг эсэх
 */
export default function MediumSpinner({ text, hasBackground, handleDom })
{
    const loaderRef = useRef()

    useEffect(
        () =>
        {
            if (handleDom)
            {
                handleDom(loaderRef.current)
            }
        },
        [handleDom]
    )

    return (
        <div ref={ref => ref = loaderRef} className={`${styles.loader} ${hasBackground && styles.background} ${text ? styles.absolute : ""}`} >
            <div className={`${styles.reverseSpinner} ${styles.medium}`}>
            </div>
        </div>
    )
}

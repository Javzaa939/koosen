import React from 'react'
import styles from './style.module.css'

const FullSpinner = ({ text}) => {
  return (
    <div className={`${styles.fullScreen} ${styles.loader} ${styles.backgroundBlack}`}>
        <div className={`${styles.reverseSpinner}`}>
          {/* {text && 'Түр хүлээнэ үү...'} */}
        </div>
    </div>
  )
}
export default FullSpinner

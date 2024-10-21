import { useState } from 'react'
import './style.css'
import { t } from 'i18next'
import { Switcher } from './helpers/Switcher'
import ReportGroupPayment from './SlidesGroups/ReportGroupPayment'
import ReportGroupGender from './SlidesGroups/ReportGroupGender'

export default function Report() {
    const [isPaymentModeOn, setIsPaymentModeOn] = useState(false);

    return (
        <div className='d-flex flex-wrap'>
            <Switcher label={t('Төлбөр')} setIsOn={setIsPaymentModeOn} isOn={isPaymentModeOn} />
            {isPaymentModeOn
                ?
                <ReportGroupPayment />
                :
                <ReportGroupGender />
            }
        </div>
    )
}

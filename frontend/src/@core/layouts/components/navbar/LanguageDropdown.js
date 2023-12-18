// ** Third Party Components
import ReactCountryFlag from 'react-country-flag'

// ** Reactstrap Imports
import { UncontrolledDropdown, DropdownMenu, DropdownItem, DropdownToggle } from 'reactstrap'

import { useTranslation } from "react-i18next";

const languages = [
    {
        countryCode: 'mn',
        countryName: 'Монгол',
        language: 'mn'
    },
    {
        countryCode: 'us',
        countryName: 'English',
        language: 'en'
    },
]

const LanguageDropdown = () => {
    // ** Hooks
    const { i18n } = useTranslation()

    const langObj = languages.find((language) => language.language === i18n.language)

    // ** Function to switch Language
    const handleLangUpdate = (e, lang) => {
        e.preventDefault()
        i18n.changeLanguage(lang)
    }

    return (
        <UncontrolledDropdown href='/' tag='li' className='dropdown-language nav-item'>
            <DropdownToggle href='/' tag='a' className='nav-link' onClick={e => e.preventDefault()}>
                <ReactCountryFlag
                    svg
                    className='country-flag flag-icon'
                    countryCode={i18n.language === 'en' ? 'us' : i18n.language}
                />
                {/* <span className='selected-language'>{langObj?.countryName}</span> */}
            </DropdownToggle>
            <DropdownMenu className='mt-0'>
                {
                    languages.map((lang, idx) => {
                        return (
                            <DropdownItem key={idx} href='/' tag='a' onClick={e => handleLangUpdate(e, lang.language)}>
                                <ReactCountryFlag className='country-flag' countryCode={lang.countryCode} svg />
                                <span className='ms-1'>{lang.countryName}</span>
                            </DropdownItem>
                        )
                    })
                }
            </DropdownMenu>
        </UncontrolledDropdown>
    )
}

export default LanguageDropdown

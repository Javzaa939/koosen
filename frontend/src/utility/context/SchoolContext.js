import { createContext, useState } from "react";
import { t } from 'i18next';

const SchoolContext = createContext();

export default SchoolContext;

/**
    ** Бүрэлдэхүүн сургуулийн id-г авах context
    * @param {String}           setSchool           Сонгосон сургуулийн id-г авна
    * @param {String}           school_id           Тухайн сургуулийн id
    * @param {String}           schoolName          Сонгосон сургуулийн нэр-г авна
    * @param {String}           setSchoolName       Сонгосон сургуулийн нэр
*/

export const SchoolContextProvider = ({ children }) => {

    const [ school_id, setSchool ] = useState('')
    const [ schoolName, setSchoolName ] = useState(t('Админ'));
    const [ parentschoolName, setParentSchoolName ] = useState(t('Админ'));

    return (
        <SchoolContext.Provider value={{ school_id, setSchool, schoolName, setSchoolName, parentschoolName, setParentSchoolName}}>
            {children}
        </SchoolContext.Provider>
    );
};

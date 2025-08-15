import { t } from 'i18next';
import { useState, useEffect, useContext } from 'react'

import ReactCountryFlag from 'react-country-flag'

// ** Reactstrap Imports
import { UncontrolledDropdown, DropdownMenu, DropdownItem, DropdownToggle } from 'reactstrap'

import {Circle } from 'react-feather';
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import SchoolContext from '@context/SchoolContext'
import AuthContext from "@context/AuthContext"

const IntlDropdown = () => {

    const [ schools, setSchools ] = useState([]);

    const { setSchool, school_id, schoolName, setSchoolName, parentschoolName, setParentSchoolName } = useContext(SchoolContext)
    const { user } = useContext(AuthContext)

    var school_value = user?.school_id || ''

    // Хэрэглэгчийн харьяалагдах салбар сургуулийн id
    const [schoolId, setSchoolId] = useState(school_value)

    // Loader
	const { fetchData } = useLoader({})

    const schoolApi = useApi().hrms.subschool
    const parentschoolApi = useApi().hrms.school

    /* Үндсэн сургуулийн дата авах функц */
    async function getParentSchool() {
        const {success, data} = await fetchData(parentschoolApi.get())
        if(success) {
            if(data?.length === 1) {
                setSchoolName(data?.[0]?.name)
                setParentSchoolName(data?.[0]?.name)
            }
        }
    }

    /* Сургуулийн жагсаалтын дата авах функц */
    async function getDatas() {
        const {success, data} = await fetchData(schoolApi.get())
        if(success) {
            /** Хэрэглэгчийн харьяалагдах сургуулийн мэдээллийг авна */
            var school_detail = []
            var my_school_ids = []              // Харьяалагдаж байгаа сургуулийн id-г хадгалах хувьсагч

            // Үндсэн харьяалагдаж байгаа сургууль
            if(user?.school_id && !my_school_ids?.includes(user?.school_id)) {
                my_school_ids.push(user?.school_id)
            }

            // Давхар харьяалагдаж байгаа сургууль
            if(user?.add_sub_orgs?.length > 0) {
                my_school_ids = [...new Set(my_school_ids.concat(user?.add_sub_orgs))]
            }

            // Нийт харьяалагдаж байгаа сургууль
            if(my_school_ids?.length > 0) {
                school_detail = data?.filter((value) => my_school_ids.includes(value.id))
            } else {
                school_detail = data
            }

            if(school_detail?.length === 1) {
                // Зөвхөн нэг харьяалалтай байх юм бол үндсэн сургуулийн нэрийг харуулахгүй
                setSchool(school_detail[0].id)
                setSchoolId(school_detail[0].id)
                setSchoolName(school_detail[0].name)
            } else if(school_detail?.length > 0 && school_detail?.length !== data?.length) {
                // Салбар сургуульд харьяалалтай ч гэсэн бүх сургуулийн эрх байхгүй үед хамгийн эхний сургуулийг харуулна
                setSchool(school_detail[0].id)
                setSchoolName(school_detail[0].name)
            } else if(user?.school_id) {
                setSchool(user?.school_id || '')
                setSchoolName(data.find((value) => value.id === user?.school_id)?.name)
            }

            setSchools(school_detail)
        }
    }

    // ** Function to switch Language
    const handleLangUpdate = (e, name, id) => {
        e.preventDefault()
        setSchoolName(name)
        setSchool(id)
    }

    useEffect(
        () =>
        {
            getParentSchool()
        },
        []
    )

    useEffect(() => {
        getDatas()
    }, [user])

    return (
        <UncontrolledDropdown href='/' tag='li' className='dropdown-language nav-item '>
            <DropdownToggle href='/' tag='a' className='nav-link text-decoration-underline' onClick={e => e.preventDefault()}>
                <i className="far fa-university me-50"></i>
                <span className='selected-language'>{schoolName}</span>
            </DropdownToggle>
            {
                /** Хэрэглэгчийн сургуулийн харьяалал 0 байвал бүх сургуулийг харах эрхтэй байна. */
               !schoolId
               ?
                    <DropdownMenu className='me-0'  style={{ maxHeight: '400px', overflowY: 'auto'}}>
                        <DropdownItem href='/' tag='a' onClick={e => handleLangUpdate(e, parentschoolName, schoolId)}>
                            <ReactCountryFlag className='country-flag' svg />
                            <i className="far fa-university me-50"></i>
                            <span className='ms-1' style={{ fontSize: '13px'}}>{parentschoolName}</span>
                        </DropdownItem>
                        {
                            schools.map((school, idx) =>
                            {
                                return (
                                    <DropdownItem key={idx} href='/' tag='a' onClick={e => handleLangUpdate(e, school.name, school.id)} data-bs-spy="scroll">
                                        <ReactCountryFlag className='country-flag' svg />
                                        <i className="far fa-circle"></i>
                                        <span className='ms-1 ' style={{ fontSize: '13px'}}>{school.name}</span>
                                    </DropdownItem>
                                )
                            })
                        }
                    </DropdownMenu>
                :
                    null
            }
        </UncontrolledDropdown>
    )
}

export default IntlDropdown

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
            setParentSchoolName(data[0]?.name)
        }
    }

    /* Жагсаалтын дата авах функц */
    async function getDatas() {
        const {success, data} = await fetchData(schoolApi.get())
        if(success) {
            setSchools(data)
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
            getDatas()
            if(user && Object.keys(user).length > 0 && user.school_id) {
                setSchool(user.school_id)
            }
        },
        []
    )

    useEffect(() => {
        /** Хэрэглэгчийн харьяалагдах сургуулийн мэдээллийг авна */
        var school_detail = []
        if(school_id) {
            school_detail = schools.filter((value) => value.id == school_id)
        }
        if(school_detail.length > 0) {
            setSchoolName(school_detail[0].name)
            setSchool(school_detail[0].id)
        }
    },[school_id, schools])

    return (
        <UncontrolledDropdown href='/' tag='li' className='dropdown-language nav-item '>
            <DropdownToggle href='/' tag='a' className='nav-link' onClick={e => e.preventDefault()}>
                <i className="far fa-university me-50"></i>
                <span className='selected-language'>{schoolName}</span>
            </DropdownToggle>
            {
                /** Хэрэглэгчийн сургуулийн харьяалал 0 байвал бүх сургуулийг харах эрхтэй байна. */
               !schoolId &&
                    <DropdownMenu className='me-0'  style={{ maxHeight: '600px', overflowY: 'auto'}}>
                        <DropdownItem href='/' tag='a' onClick={e => handleLangUpdate(e, parentschoolName, schoolId)}>
                            <ReactCountryFlag className='country-flag' svg />
                            <i className="far fa-university me-50"></i>
                            <span className='ms-1' style={{ fontSize: '13px'}}>{parentschoolName}</span>
                        </DropdownItem>
                        {
                            schools.map((school, idx) => {
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
            }
        </UncontrolledDropdown>
    )
}

export default IntlDropdown

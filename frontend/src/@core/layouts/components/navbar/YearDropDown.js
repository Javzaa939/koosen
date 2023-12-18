import { useContext, useEffect, useState } from 'react'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

// ** Reactstrap Imports
import { UncontrolledDropdown, DropdownToggle } from 'reactstrap'

import ActiveYearContext from '@context/ActiveYearContext'

const YearDropDown = () => {

    const { setYearContext, setSeasonContext, setSeasonNameContext } = useContext(ActiveYearContext)

    const [yearName, setYear] = useState('')
    const [seasonName, setSeason] = useState('')
    const [seasonId, setSeasonId] = useState('')

    // Api
    const activeYearApi = useApi().settings.activeyear
	const { fetchData } = useLoader({})

    /* Жагсаалтын дата авах функц */
    async function getDatas() {
        const {success, data} = await fetchData(activeYearApi.getActiveYear())
        if(success) {
            setYear(data?.active_lesson_year)
            setSeason(data?.active_season)
            setSeasonId(data?.active_lesson_season)
            setSeasonNameContext(data?.season_name)

            setSeason(data?.active_season_name)
        }
    }

    useEffect(() => {
        setYearContext(yearName)
        setSeasonNameContext(seasonName)
        setSeasonContext(seasonId)
    },[yearName, seasonName, seasonId])

    useEffect(() => {
        getDatas()
    },[])

    return (
        <UncontrolledDropdown href='/' tag='li' className='dropdown-language nav-item'>
            <DropdownToggle href='/' tag='a' className='nav-link' onClick={e => e.preventDefault()}>
                <i className="fas fa-th-large me-50"></i>
                <span className='selected-language'>{yearName}, {seasonName}</span>
            </DropdownToggle>
        </UncontrolledDropdown>
    )
}

export default YearDropDown

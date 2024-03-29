import React, { useEffect, useState } from 'react'
import { Button } from 'reactstrap'

import useLoader from '@hooks/useLoader';
import useApi from '@hooks/useApi';

function Email() {

    const [datas, setDatas] = useState(1)

	const { isLoading, fetchData } = useLoader({});

	const elseltApi = useApi().elselt.admissionuserdata.email

	async function getDatas() {
        const {success, data} = await fetchData(elseltApi.get())
        if(success) {
            setDatas(data)
        }
	}

    useEffect(() => {
        getDatas()
    }, [])

    console.log(datas,'datas')

    return (
        <div>
            email
            <Button onClick={() => {getDatas()}}>
                GET
            </Button>
        </div>
    )
}

export default Email

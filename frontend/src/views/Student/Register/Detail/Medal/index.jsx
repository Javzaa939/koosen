// ** React imports
import React, { useState, useEffect, useContext } from 'react'

import { useParams } from 'react-router-dom';

import {
	Input,
    Card,
    CardBody, ListGroup, ListGroupItem,
} from "reactstrap";

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import AuthContext from '@context/AuthContext'

const Medal = () => {

    // Loader
	const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: true });

    const { user } = useContext(AuthContext)
    const { studentId } = useParams()

    const [disabled, setDisabled] = useState(true)
    const [checkedMedals, setCheckedMedals] = useState([])

    const [medalTypeDatas, setMedalTypeDatas] = useState([])

    // API
    const medalApi = useApi().student.medal

    useEffect(() => {
        /** Эрх шалгана */
        if(Object.keys(user).length > 0 && user.permissions.includes('lms-student-register-update')) {
            setDisabled(false)
        }
    },[user])

    async function onSubmit(checked) {
        let cdatas = {
            'student': studentId,
            'medals': checked,
        }

        const { success, error } = await fetchData(medalApi.post(cdatas, studentId))
        if(success) {
            setCheckedMedals(checked)
        }
	}

    const getDatas = async() => {
        const { success, data } = await fetchData(medalApi.get(studentId))
        if(success) {
            setMedalTypeDatas(data)

            const checkedIds = data?.filter((item) => item?.is_checked)?.map((val) => val?.id) || []
            setCheckedMedals(checkedIds)
        }
    }

    useEffect(() => {
        getDatas()
    }, [])

    function handleChecked(id) {
        let newChecked = [...checkedMedals]
        if(!newChecked?.includes(id)) {
            newChecked.push(id)
        } else {
            const index = newChecked.indexOf(id)
            if (index > -1) newChecked.splice(index, 1)
        }
        onSubmit(newChecked)

    }

	return (
        <Card>
            {isLoading && Loader}
            <CardBody className='p-0'>
                <ListGroup tag='div'>
                    {
                        medalTypeDatas?.map((mtype, idx) => {
                            return(
                                <ListGroupItem
                                    key={idx}
                                >
                                    <span>
                                        <img
                                            src={`data:image/jpeg;base64,${mtype?.image}`}
                                            alt="img"
                                            width={35}
                                            height={35}
                                            style={{ objectFit: 'cover' }}
                                            onError={({ currentTarget }) => {
                                                currentTarget.onerror = null; // prevents looping
                                            }}
                                        />
                                        <span className='ms-1'>{mtype?.name}</span>
                                        <Input
                                            checked={checkedMedals?.includes(mtype.id)}
                                            className='mx-1 mt-50'
                                            type='checkbox'
                                            disabled={disabled}
                                            onChange={() => handleChecked(mtype?.id)}
                                        />
                                    </span>
                                </ListGroupItem>
                            )}
                        )
                    }
                </ListGroup>
            </CardBody>
        </Card>
	);
};

export default Medal;

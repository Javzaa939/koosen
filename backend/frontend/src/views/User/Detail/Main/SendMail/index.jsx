import React from 'react';

import { useParams } from 'react-router-dom';

import { Card, CardBody, Button, Spinner } from 'reactstrap';

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

const SendMail = () => {

    const { userID } = useParams()

    const userApi = useApi().user
	const { isLoading, fetchData } = useLoader({})

    async function onSubmit() {
        const { success } = await fetchData(userApi.refresh_token(userID))
        if (success) {
            //
        }
    }

    return (
        <Card>
            <CardBody className="p-1">
                <h5 className='mb-0'>Шинээр нууц үг оруулах мэйл илгээх</h5>
                <hr/>
                <Button color='primary' onClick={() => onSubmit()}>
                    {
                        isLoading ?
                            <>
                                <Spinner color='white' className='me-50' size='sm' type='grow' />
                                <span>Илгээж байна...</span>
                            </>
                        :
                        <span>Илгээх</span>
                    }
                </Button>
            </CardBody>
        </Card>
    );
};

export default SendMail;

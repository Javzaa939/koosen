
import { Fragment, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, Button, CardTitle, CardHeader, Spinner } from 'reactstrap'
import { RefreshCcw } from 'react-feather'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';


export default function Able()
{
    const { t } = useTranslation()

    const { Loader, isLoading, fetchData } = useLoader({})
    const [newCount, setCount] = useState('')
    const ableApi = useApi().able

    async function getWorker()
    {
        const { success, data } = await fetchData(ableApi.getWorker())
        if (success) {
            setCount(data)
        }
    }

    async function getStructure()
    {
        let response = await fetchData(ableApi.getPosition())
    }

    return (
        <Fragment>
            <Card>
                {isLoading && Loader}
                <CardHeader className="flex-md-row align-items-center flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4">{t('Able Албан тушаал')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button
							color='primary'
							onClick={() => getStructure()}
						>
                            <RefreshCcw size={15} />
                            <span className='align-middle ms-50'>{t('Шинэчлэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
            </Card>
            <Card>
                <CardHeader className="flex-md-row align-items-center flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4">{t('Able Ажилчид')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button
							color='primary'
							onClick={() => getWorker()}
						>
                            <RefreshCcw size={15} />
                            <span className='align-middle ms-50'>{t('Шинэчлэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
            </Card>
        </Fragment>
    )
}

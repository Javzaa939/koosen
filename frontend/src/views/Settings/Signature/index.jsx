
import { useState, useEffect } from 'react'
import { Card, CardTitle, CardHeader } from 'reactstrap'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'react-feather'
import DataTable from 'react-data-table-component'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import { getPagination } from '@utils'
import { getColumns } from './helpers'
import UpdateModal from './Modal'


export default function Signature()
{
    const { t } = useTranslation()

    // Api
	const signatureApi = useApi().settings.signature

    const { isLoading, fetchData } = useLoader({});

	const [datas, setDatas] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [total_count, setTotalCount] = useState(datas.length || 1)
    const [modal, setModal] = useState(false)
    const [clicked, setClicked] = useState(null)

    const handleModal = () => {
        setModal(!modal)
    }

    // Хуудас солих үед ажиллах хэсэг
	const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	};

    async function getDatas()
    {
        const { success, data } = await fetchData(signatureApi.getDataTable())
		if(success)
        {
			setDatas(data)
			setTotalCount(data.length)
		}
    }

    useEffect(
        () =>
        {
            getDatas()
        },
        []
    )

    return (
        <>
            <Card>
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
                    <CardTitle tag="h4">{t('Тодорхойлолтын гарын үсэг зурах тохиргоо')}</CardTitle>
                </CardHeader>
                <div className="react-dataTable react-dataTable-selectable-rows">
                    <DataTable
                        noHeader
                        pagination
                        className='react-dataTable'
                        progressPending={isLoading}
                        progressComponent={(
                            <div className='my-2'>
                                <h5>{t('Түр хүлээнэ үү')}...</h5>
                            </div>
                        )}
                        noDataComponent={(
                            <div className="my-2">
                                <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                            </div>
                        )}
                        columns={getColumns(currentPage, rowsPerPage, datas, handleModal, setClicked)}
                        sortIcon={<ChevronDown size={10} />}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        data={datas}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count, '', [])}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                    />
                </div>
            </Card>
            {
                modal
                ?
                    <UpdateModal open={modal} handleModal={handleModal} edit={clicked} />
                :
                    null
            }
        </>
    )
}

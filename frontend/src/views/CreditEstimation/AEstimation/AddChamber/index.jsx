import React, { useEffect, useState, useRef } from 'react'

import {
    Modal,
    ModalBody,
    ModalHeader,
    Input,
} from 'reactstrap'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import CTable from '@lms_components/CTable'

function UpdateInput(props) {

    const {
        rowIdx,
        colIdx,
        row,
        column,
        datas,
        editId,
        setDatas,
    } = props

    const [ value, setChangeValue ] = useState('')

    const focusData = useRef(undefined)

    const estimateTypeApi = useApi().credit.estimation

    const { fetchData } = useLoader({})

    const handleChange = (e) => {
        setChangeValue(e.target.value)
    }

    const handleSetTeachResult = async(event) => {
        if (["e", "E", "+", "-"].includes(event.key))
        {
            event.preventDefault()
        }
        if (event.key === 'Enter')
        {
            const rowsInput = [...datas];

            rowsInput[rowIdx][column?.key] = value;
            var item_datas = rowsInput[rowIdx]

            item_datas['timeestimatea'] = editId

            const { success, error } = await fetchData(estimateTypeApi.postChamber(item_datas))
            if(success)
            {
                var amount = item_datas.amount
                var ratio = item_datas.ratio

                var exec_kr = amount * ratio

                exec_kr = exec_kr.toFixed(2)

                rowsInput[rowIdx].exec_kr = exec_kr

                setDatas(rowsInput)

                focusData.current = undefined
                var nextElementId = 'score' + '-' + (colIdx) + (rowIdx + 1)
                var element = document.getElementById(`${nextElementId}`)

                if (element) element.focus()
                else event.preventDefault()
            } else {
                focusData.current = ''
            }
        }
    };

    /** Input-ээс идэвхгүй болох үеийн event */
    const focusOut = (event) => {
        if (focusData.current || focusData.current == '')
        {
            event.target.value = focusData.current
        }
    }

    return(
        <div className='text-center mt-1'>
            <Input
                style={{ maxWidth: '220px'}}
                name={`score-${colIdx}`}
                id={`score-${colIdx}${rowIdx}`}
                key={`score-${colIdx}${rowIdx}`}
                bsSize='sm'
                type='number'
                disabled={row?.import_score}
                defaultValue={row[column.key] || ''}
                placeholder="Тоо хэмжээ"
                onBlur={focusOut}
                onChange={(e) => handleChange(e)}
                onFocus={(e) => { focusData.current = e.target.value}}
                onKeyPress={(e) => { handleSetTeachResult(e) }}
            />
        </div>
    )
}

export default function AddChamber({ isOpen, handleModal, editId }) {

    const headers = [
        {
            key: 'name',
            name: 'Нэр',
            editable: false,
            center: false,
        },
        {
            key: 'ratio',
            name: 'Коэффициент',
            editable: false,
            center: true,
        },
        {
            key: 'amount',
            name: 'Тоо',
            editable: true,
            center: true,
            component: (props) => UpdateInput(props)
        },
        {
            key: 'exec_kr',
            name: 'Гүйцэтгэлийн кредит',
            center: true,
        },
    ]

    const [ datas, setDatas ] = useState([])

    const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: true })

    // API
    const estimateTypeApi = useApi().credit.estimation

    async function getDatas() {
        const { success, data } = await fetchData(estimateTypeApi.getChamberType(editId))
        if (success) {
            setDatas(data)
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
        {
        isLoading
        ?
            Loader
        :
            <Modal
                isOpen={isOpen}
                toggle={handleModal}
                className="modal-dialog-centered modal-lg"
            >
                <ModalHeader toggle={handleModal}>{'Танхимийн бус цаг нэмэх'}</ModalHeader>
                <ModalBody>
                    <CTable
                        headers={headers}
                        cdatas={datas}
                        rowsPerPage={10}
                        pagination={true}
                        setDatas={setDatas}
                        editId={editId}
                    />
                </ModalBody>
                </Modal>
        }
        </>
    )
}

import React from 'react'

import './style.scss'
import { AlertTriangle, ChevronsLeft, Home } from 'react-feather'
import { useNavigate } from 'react-router-dom'

function PrintError() {

    const navigate = useNavigate()

    return (
        <div className='null_page_parent d-flex justify-content-center align-items-center' style={{ height:'100vh' }}>
            <div className='null_page_content'>
                <div className='text-center mb-2'>
                    <div className='custom_warning_badge d-inline-block '>
                        <AlertTriangle size={20}/> <span> Уучлаарай алдаа гарлаа </span>
                    </div>
                </div>
                <div className='d-flex flex-wrap justify-content-center'>
                    <div className='goback_button p-50 m-1 mb-0 text-center rounded-3' role='button' onClick={() => window.history.go(-1)}>
                        <ChevronsLeft size={16} className='null_page_content' /> Буцах
                    </div>
                    <div className='p-50 m-1 mb-0 gohome_button' role='button' onClick={() => navigate(`/`)}>
                        <Home size={16}/> Нүүр хуудас руу буцах
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PrintError

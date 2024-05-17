import React from 'react'
import PrintEnglish from '../PrintEnglish'
import PrintMongolia from '../PrintMongolia'
import PrintNational from '../PrintNational'

function PrintMain() {
    return (
        <div>
            <PrintMongolia/>
            <PrintEnglish/>
            <PrintNational/>
        </div>
    )
}

export default PrintMain

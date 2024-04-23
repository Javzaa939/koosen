import React from 'react'
import { HelpCircle } from 'react-feather'
import { UncontrolledTooltip } from 'reactstrap'

function Help(
    {
        text,
        className=''
    }
) {

    if(!text){
        console.warn('Та тусламжийн компонентийг дуудсан байна. Өөрийн текстээ оруулна уу !!!')
    }

    return (
        <div className={className}>
            <HelpCircle size={14} id='UncontrolledTooltipExample' style={{ cursor:'help' }}/>
            <UncontrolledTooltip
                placement="right"
                target="UncontrolledTooltipExample"
                placementPrefix='m-2'
            >
                {text ? text : 'Та текстээ оруулна уу !!!'}
            </UncontrolledTooltip>
        </div>
    )
}

export default Help

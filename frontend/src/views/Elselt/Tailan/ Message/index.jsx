import React, { useState } from 'react'
import { Button } from 'reactstrap'

function Message() {

    const [datas, setDatas] = useState(1)

    async function getDatas() {
        setDatas()
    }

    console.log(datas,'datas')

    return (
        <div>
            test
            <Button onClick={() => {getDatas()}}>
                GET
            </Button>
        </div>
    )
}

export default Message

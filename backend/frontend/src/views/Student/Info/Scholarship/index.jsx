
import React, { useState } from "react"

import { Card, UncontrolledCollapse, Table, Badge } from "reactstrap"
import { Eye } from 'react-feather'
import { useTranslation } from 'react-i18next'

import Files from "./Files"

export default function Scholarship({ datas })
{
    const { t } = useTranslation()

    const [file_modal, setFileModal] = useState(false)
    const [files, setFiles] = useState([])

    const handleFile = async(datas) =>
    {
        setFiles(datas)
        setFileModal(!file_modal)
	};

    const solved_type_color = (solved_flag) =>
    {
        let color = ''
        let solved_flag_name = ''
        if (solved_flag === 1) {
            color = 'light-primary'
            solved_flag_name = 'ИЛГЭЭСЭН'
        }
        else if (solved_flag === 2) {
            color = 'light-warning'
            solved_flag_name = 'БУЦААСАН'
        }
        else if (solved_flag === 3) {
			color = 'light-primary'
			solved_flag_name = 'ЗӨВШӨӨРСӨН'
        }
        else if (solved_flag === 4) {
			color = 'light-danger'
			solved_flag_name = 'ТАТГАЛЗСАН'
        }

        return (
			<Badge color={color} pill>
				{solved_flag_name}
			</Badge>
        )
    }

    return (
        <>
            <Card className='mt-1 m-0'>
                <div className='added-cards border'>
                    <div className='cardMaster rounded p-1 fw-bolder underline text-decoration-underline' role="button" id="scoreScholarship">
                        Тэтгэлэг
                    </div>

                    <UncontrolledCollapse toggler="#scoreScholarship" className="m-2">
                    <hr />
                    <div className='added-cards'>
                        <div className='cardMaster rounded pb-1 pt-2' >
                            <h5 className='text-center pb-50'>Тэтгэлэг</h5>
                        </div>
                    </div>

                    <Table bordered responsive className='table'>
                            <thead>
                                <tr>
                                    <th>Тэтгэлэгийн нэр</th>
                                    <th>Хэсэлт</th>
                                    <th>Файл</th>
                                    <th>Төлөв</th>
                                    <th>Шийдвэрийн тайлбар</th>
                                    <th>Огноо</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    datas && datas.length > 0 &&
                                    datas.map((data, idx) => {
                                        return (
                                            <tr key={idx}>
                                                <td>{data?.stipent?.stipend_type?.name}</td>
                                                <td>{data?.request}</td>
                                                <td>
                                                    {
                                                        data.files && data.files.length > 0
                                                        ?
                                                            <Eye role="button" color='blue' size={15} onClick={() => handleFile(data)}/>
                                                        :
                                                            <p className='p-0'>
                                                                {t('Хоосон байна')}
                                                            </p>
                                                    }
                                                </td>
                                                <td>{solved_type_color(data?.solved_flag)}</td>
                                                <td>{data?.solved_message}</td>
                                                <td>{data.created_at}</td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </Table>

                        <div className="text-end" >
                            <button className="btn btn-primary me-2 mt-1" onClick={() => { document.getElementById('scoreScholarship').click() }} >
                                Хаах
                            </button>
                        </div>

                    </UncontrolledCollapse>

                </div>
            </Card>
            {
                file_modal && <Files open={file_modal} handleModal={handleFile} datas={files} />
            }
        </>
    )
}

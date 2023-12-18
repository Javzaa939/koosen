
import React from "react"

import { UncontrolledCollapse, Card, Table } from 'reactstrap';

export default function Institute({ datas })
{
    const invention = datas?.inventionData
    const paper = datas?.paperData
    const note = datas?.noteData
    const quotation = datas?.quotationData
    const project = datas?.projectData
    const contract = datas?.contractworkData
    const patent = datas?.patentData
    const certpatent = datas?.certpatentData
    const symbolcert = datas?.symbolcertData
    const licensecert = datas?.licensecertData
    const rightcert = datas?.rightcertData

    return (
        <Card className='mt-1 m-0'>
            {
            <div className='added-cards border'>
                <div className='cardMaster rounded p-1 fw-bolder underline text-decoration-underline' role="button" id="institute">
                    Эрдэм шинжилгээ
                </div>
                {/* {
                    invention && invention.length > 0 && paper && paper.length > 0 && note && note.length > 0 && quotation && quotation.length > 0 &&
                } */}
                <UncontrolledCollapse toggler="#institute" className="m-2">
                    <div className='cardMaster rounded underline text-decoration-underline' role="button" id="publicity">
                        <h5> 1. Хэвлэн нийтлэл</h5>
                    </div>
                    {
                    invention && invention.length > 0 &&
                        <UncontrolledCollapse toggler="#publicity">
                            <div className="ms-1 mb-1 underline text-decoration-underline" role="button" id="invention">
                                1.1. Бүтээл
                            </div>
                            <UncontrolledCollapse toggler="#invention" >
                                <Table bordered responsive className='table'>
                                    <thead>
                                        <tr>
                                            <th>Бүтээлийн нэр</th>
                                            <th>Бүтээлийн он</th>
                                            <th>Бүтээлийн ангилал</th>
                                            <th>ISBN дугаар</th>
                                            <th>Товч танилцуулга</th>

                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                        invention && invention.length > 0 &&
                                        invention.map((data, idx) => {
                                            return (
                                                <tr key={idx}>
                                                    <td>{data?.name}</td>
                                                    <td>{data?.published_year}</td>
                                                    <td>{data?.category?.name}</td>
                                                    <td>{data?.isbn}</td>
                                                    <td>{data?.summary}</td>
                                                </tr>
                                            )
                                        })
                                        }
                                    </tbody>
                                </Table>
                            </UncontrolledCollapse>
                        </UncontrolledCollapse>
                    }
                    {
                    paper && paper.length > 0 &&
                        <UncontrolledCollapse toggler="#publicity">
                            <div className="ms-1 mb-1 mt-1 underline text-decoration-underline" role="button" id="article">
                                1.2. Өгүүлэл
                            </div>
                            <UncontrolledCollapse toggler="#article" >
                                <Table bordered responsive className='table'>
                                    <thead>
                                        <tr>
                                            <th>Өгүүллийн нэр</th>
                                            <th>Өгүүллийн төрөл</th>
                                            <th>Өгүүллийн ангилал</th>
                                            <th>DOI дугаар</th>
                                            <th>ISSN дугаар</th>
                                            <th>Өгүүллийн он</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                        paper && paper.length > 0 &&
                                        paper.map((data, idx) => {
                                            return (
                                                <tr key={idx}>
                                                    <td>{data?.name}</td>
                                                    <td>{data?.papertype_name}</td>
                                                    <td>{data?.category?.name}</td>
                                                    <td>{data?.doi_number}</td>
                                                    <td>{data?.issn_number }</td>
                                                    <td>{data?.published_year}</td>
                                                </tr>
                                            )
                                        })
                                        }
                                    </tbody>
                                </Table>
                            </UncontrolledCollapse>
                        </UncontrolledCollapse>
                    }
                    {
                    note && note.length > 0 &&
                        <UncontrolledCollapse toggler="#publicity">
                            <div className="ms-1 mb-1 mt-1 underline text-decoration-underline" role="button" id="speech">
                                1.3. Илтгэл
                            </div>
                            <UncontrolledCollapse toggler="#speech" >
                                <Table bordered responsive className='table'>
                                    <thead>
                                        <tr>
                                            <th>Хурлын нэр</th>
                                            <th>Хурлын ангилал</th>
                                            <th>Хурал зохион байгуулсан байгууллагын нэр</th>
                                            <th>Хурлын огноо</th>
                                            <th>Хурал зохион байгуулагдсан улс</th>
                                            <th>Хуралд оролцсон улсын тоо</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                        note && note.length > 0 &&
                                        note.map((data, idx) => {
                                            return (
                                                <tr key={idx}>
                                                    <td>{data?.meeting_name}</td>
                                                    <td>{data?.category_name}</td>
                                                    <td>{data?.meeting_org_name}</td>
                                                    <td>{data?.meeting_date}</td>
                                                    <td>{data?.country?.name}</td>
                                                    <td>{data?.country_number}</td>

                                                </tr>
                                            )
                                        })
                                        }
                                    </tbody>
                                </Table>
                            </UncontrolledCollapse>
                        </UncontrolledCollapse>
                    }
                    {
                    quotation && quotation.length > 0 &&
                        <UncontrolledCollapse toggler="#publicity">
                            <div className="ms-1 mb-1 mt-1 underline text-decoration-underline" role="button" id="quote">
                                1.4. Эшлэл
                            </div>
                            <UncontrolledCollapse toggler="#quote" >
                                <Table bordered responsive className='table'>
                                    <thead>
                                        <tr>
                                            <th>Эшлэлийн нэр</th>
                                            <th>Эшлэлийн ангилал</th>
                                            <th>DOI дугаар</th>
                                            <th>Эшлэлийн тоо</th>
                                            <th>Эшлэлд татагдсан он</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                        quotation && quotation.length > 0 &&
                                        quotation.map((data, idx) => {
                                            return (
                                                <tr key={idx}>
                                                    <td>{data?.name}</td>
                                                    <td>{data?.category?.name}</td>
                                                    <td>{data?.doi_number}</td>
                                                    <td>{data?.quotation_number}</td>
                                                    <td>{data?.quotation_year}</td>
                                                </tr>
                                            )
                                        })
                                        }
                                    </tbody>
                                </Table>
                            </UncontrolledCollapse>
                        </UncontrolledCollapse>
                    }
                    <hr />
                    <div className='cardMaster rounded pt-1 underline text-decoration-underline' role="button" id="work">
                        <h5> 2. Төсөл, гэрээт ажил</h5>
                    </div>
                    {
                    project && project.length > 0 &&
                        <UncontrolledCollapse toggler="#work">
                            <div className="ms-1 mb-1 mt-1 underline text-decoration-underline" role="button" id="project">
                                2.1. Төсөл
                            </div>
                            <UncontrolledCollapse toggler="#project" >
                                <Table bordered responsive className='table'>
                                    <thead>
                                        <tr>
                                            <th>Төслийн нэр</th>
                                            <th>Төслийн ангилал</th>
                                            <th>Эхлэх хугацаа</th>
                                            <th>Дуусах хугацаа</th>
                                            <th>Төслийн удирдагч</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                        project && project.length > 0 &&
                                        project.map((data, idx) => {
                                            return (
                                                <tr key={idx}>
                                                    <td>{data?.name}</td>
                                                    <td>{data?.category?.name}</td>
                                                    <td>{data?.start_date}</td>
                                                    <td>{data?.end_date}</td>
                                                    <td>{data?.leader_name}</td>
                                                </tr>
                                            )
                                        })
                                        }
                                    </tbody>
                                </Table>
                            </UncontrolledCollapse>
                        </UncontrolledCollapse>
                    }
                    {
                    contract && contract.length > 0 &&
                        <UncontrolledCollapse toggler="#work">
                            <div className="ms-1 mb-1 mt-1 underline text-decoration-underline" role="button" id="contract">
                                2.2. Гэрээт ажил
                            </div>
                            <UncontrolledCollapse toggler="#contract" >
                                <Table bordered responsive className='table'>
                                    <thead>
                                        <tr>
                                            <th>Гэрээний дугаар</th>
                                            <th>Гэрээт ажлын нэр</th>
                                            <th>Гэрээт ажлын удирдагч</th>
                                            <th>Санхүүжүүлэгчийн нэр</th>
                                            <th>Гэрээний дүн /төг/</th>
                                            <th>Эхлэх хугацаа</th>
                                            <th>Дуусах хугацаа</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                        contract && contract.length > 0 &&
                                        contract.map((data, idx) => {
                                            return (
                                                <tr key={idx}>
                                                    <td>{data?.contract_number}</td>
                                                    <td>{data?.name}</td>
                                                    <td>{data?.leader_name}</td>
                                                    <td>{data?.finance_name}</td>
                                                    <td>{data?.contract_amount}</td>
                                                    <td>{data?.end_date}</td>
                                                    <td>{data?.start_date}</td>
                                                </tr>
                                            )
                                        })
                                        }
                                    </tbody>
                                </Table>
                            </UncontrolledCollapse>
                        </UncontrolledCollapse>
                    }
                    <hr />
                    <div className='cardMaster rounded pt-1 underline text-decoration-underline' role="button" id="property">
                        <h5> 3. Оюуны өмч</h5>
                    </div>
                    {
                    patent && patent.length > 0 &&
                        <UncontrolledCollapse toggler="#property">
                            <div className="ms-1 mb-1 mt-1 underline text-decoration-underline" role="button" id="new">
                                3.1. Шинэ бүтээлийн патент
                            </div>
                            <UncontrolledCollapse toggler="#new" >
                                <Table bordered responsive className='table'>
                                    <thead>
                                        <tr>
                                            <th>Шинэ бүтээлийн нэр</th>
                                            <th>Улсын бүртгэлийн дугаар</th>
                                            <th>Хүчинтэй хугацаа</th>
                                            <th>Товч тайлбар</th>
                                            <th>Зах зээлийн хэрэглээ</th>
                                            <th>Шинжлэх ухааны салбар</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                        patent && patent.length > 0 &&
                                        patent.map((data, idx) => {
                                            return (
                                                <tr key={idx}>
                                                    <td>{data?.name}</td>
                                                    <td>{data?.register_number}</td>
                                                    <td>{data?.end_date}</td>
                                                    <td>{data?.abstract}</td>
                                                    <td>{data?.market_usage}</td>
                                                    <td>{data?.science_field?.name}</td>
                                                </tr>
                                            )
                                        })
                                        }
                                    </tbody>
                                </Table>
                            </UncontrolledCollapse>
                        </UncontrolledCollapse>
                    }
                    {
                    certpatent && certpatent.length > 0 &&
                        <UncontrolledCollapse toggler="#property">
                            <div className="ms-1 mb-1 mt-1 underline text-decoration-underline" role="button" id="patent">
                                3.2. Ашигтай загварын патент
                            </div>
                            <UncontrolledCollapse toggler="#patent" >
                                <Table bordered responsive className='table'>
                                    <thead>
                                        <tr>
                                            <th>Ашигтай загварын нэр</th>
                                            <th>Улсын бүртгэлийн дугаар</th>
                                            <th>Товч тайлбар</th>
                                            <th>Патент олгосон оюуны өмчийн газрын даргын тушаалын огноо</th>
                                            <th>Хүчинтэй хугацаа</th>
                                            <th>Зах зээлийн хэрэглээ</th>
                                            <th>Шинжлэх ухааны салбар</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                        certpatent && certpatent.length > 0 &&
                                        certpatent.map((data, idx) => {
                                            return (
                                                <tr key={idx}>
                                                    <td>{data?.name}</td>
                                                    <td>{data?.register_number}</td>
                                                    <td>{data?.abstract}</td>
                                                    <td>{data?.start_date}</td>
                                                    <td>{data?.end_date}</td>
                                                    <td>{data?.market_usage}</td>
                                                    <td>{data?.science_field?.name}</td>

                                                </tr>
                                            )
                                        })
                                        }
                                    </tbody>
                                </Table>
                            </UncontrolledCollapse>
                        </UncontrolledCollapse>
                    }
                    {
                    symbolcert && symbolcert.length > 0 &&
                        <UncontrolledCollapse toggler="#property">
                            <div className="ms-1 mb-1 mt-1 underline text-decoration-underline" role="button" id="certific">
                                3.3. Барааны тэмдгийн гэрчилгээ
                            </div>
                            <UncontrolledCollapse toggler="#certific" >
                                <Table bordered responsive className='table'>
                                    <thead>
                                        <tr>
                                            <th>Улсын бүртгэлийн дугаар</th>
                                            <th>Бараа, үйлчилгээний олон улсын ангилал</th>
                                            <th>Гэрчилгээ олгосон оюуны өмчийн газрын даргын тушаалын огноо'</th>
                                            <th>Хүчинтэй хугацаа</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                        symbolcert && symbolcert.length > 0 &&
                                        symbolcert.map((data, idx) => {
                                            return (
                                                <tr key={idx}>
                                                    <td>{data?.register_number}</td>
                                                    <td>{data?.symbol_class}</td>
                                                    <td>{data?.start_date}</td>
                                                    <td>{data?.end_date}</td>
                                                </tr>
                                            )
                                        })
                                        }
                                    </tbody>
                                </Table>
                            </UncontrolledCollapse>
                        </UncontrolledCollapse>
                    }
                    {
                    licensecert && licensecert.length > 0 &&
                        <UncontrolledCollapse toggler="#property">
                            <div className="ms-1 mb-1 mt-1 underline text-decoration-underline" role="button" id="license">
                                3.4. Лицензийн гэрчилгээ
                            </div>
                            <UncontrolledCollapse toggler="#license" >
                                <Table bordered responsive className='table'>
                                    <thead>
                                        <tr>
                                            <th>Лиценз өгөгч талын нэр</th>
                                            <th>Лиценз авагч талын нэр</th>
                                            <th>Лицензийн ангилал</th>
                                            <th>Оюуны өмчийн улсын бүртгэлийн дугаар</th>
                                            <th>Бүртгэгдсэн огноо</th>
                                            <th>Товч мэдээлэл</th>
                                            <th>Лицензийн хугацаа</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                        licensecert && licensecert.length > 0 &&
                                        licensecert.map((data, idx) => {
                                            return (
                                                <tr key={idx}>
                                                    <td>{data?.given_name}</td>
                                                    <td>{data?.taken_name}</td>
                                                    <td>{data?.license_class}</td>
                                                    <td>{data?.register_number}</td>
                                                    <td>{data?.start_date}</td>
                                                    <td>{data?.abstract}</td>
                                                    <td>{data?.end_date}</td>
                                                </tr>
                                            )
                                        })
                                        }
                                    </tbody>
                                </Table>
                            </UncontrolledCollapse>
                        </UncontrolledCollapse>
                    }
                    {
                    rightcert && rightcert.length > 0 &&
                        <UncontrolledCollapse toggler="#property">
                            <div className="ms-1 mb-1 mt-1 underline text-decoration-underline" role="button" id="right">
                                3.5. Зохиогчийн эрхийн гэрчилгээ
                            </div>
                            <UncontrolledCollapse toggler="#right" >
                                <Table bordered responsive className='table'>
                                    <thead>
                                        <tr>
                                            <th>Бүтээлийн нэр</th>
                                            <th>Бүртгэлийн дугаар</th>
                                            <th>Туурвисан огноо</th>
                                            <th>Товч тайлбар</th>
                                            <th>ШУ-ы салбар</th>
                                            <th>Гэрчилгээ олгосон оюуны өмчийн газрын даргын тушаалын огноо</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                        rightcert && rightcert.length > 0 &&
                                        rightcert.map((data, idx) => {
                                            return (
                                                <tr key={idx}>
                                                    <td>{data?.name}</td>
                                                    <td>{data?.register_number}</td>
                                                    <td>{data?.create_date}</td>
                                                    <td>{data?.abstract}</td>
                                                    <td>{data?.science_field?.name}</td>
                                                    <td>{data?.start_date}</td>
                                                </tr>
                                            )
                                        })
                                        }
                                    </tbody>
                                </Table>
                            </UncontrolledCollapse>
                        </UncontrolledCollapse>
                    }
                    <div className="text-end" >
                        <button className="btn btn-primary me-2 mt-1" onClick={() => { document.getElementById('institute').click() }} >
                            Хаах
                        </button>
                    </div>
                </UncontrolledCollapse>
            </div>
        }
        </Card>
    )
}

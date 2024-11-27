import { t } from "i18next"
import { Fragment, useState, useContext, useEffect } from "react"
import { ChevronDown, Search, Plus } from "react-feather"
import {
Card,
CardHeader,
Row,
Badge,
AccordionItem,
AccordionHeader,
AccordionBody,
Accordion,
TabContent } from "reactstrap"
import AuthContext from '@context/AuthContext'
import SchoolContext from '@context/SchoolContext'
import useApi from "@hooks/useApi"
import useLoader from '@hooks/useLoader';
import {ProDetailAccordion} from './Detail'


const Surgalt = () => {

    // Loader
    const { isLoading, fetchData} = useLoader({isFullScreen: true})

    //Context
    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)

    //useState
    const [datas, setDatas] = useState([])
    const [dep_option, setDepartmentOption] = useState({})
    // const salbar_list = [
    //     {
    //         name: 'Цагдаагийн сургууль',
    //         active_id: 1,
    //         icon: `/images/logos/tsagdaa.png`,
    //         component: 'ЦС'
    //     },
    //     {
    //         name: 'Онцгой байдлын сургууль',
    //         active_id: 2,
    //         icon: `/images/logos/hil.png`,
    //         component: 'ХАС'
    //     },
    //     {
    //         name: 'Хилийн албаны сургууль',
    //         active_id: 3,
    //         icon: `/images/logos/hil.png`,
    //         component: 'ХАС'
    //     },
    //     {
    //         name: 'Шүүхийн шийдвэр гүйцэтгэлийн албаны сургууль',
    //         active_id: 4,
    //         icon: `/images/logos/shuuh.png`,
    //         component: 'ШШГАС'
    //     },
    //     {
    //         name: 'ШИНЖЛЭН МАГАДЛАХУЙН УХААНЫ СУРГУУЛЬ',
    //         active_id: 5,
    //         icon: `/images/logos/shinjlen.png`,
    //         component: 'ШМИ'
    //     },
    //     {
    //         name: 'АХИСАН ТҮВШНИЙ БОЛОВСРОЛЫН СУРГУУЛЬ',
    //         active_id: 6,
    //         icon: `/images/logos/ahisan.png`,
    //         component: 'АШБС'
    //     },
    //     {
    //         name: 'УДИРДЛАГЫН АКАДЕМИ',
    //         active_id: 7,
    //         icon: `/images/logos/udirdlaga.png`,
    //         component: 'УА'
    //     },
    //     {
    //         name: 'Гадаад хэлний институт',
    //         active_id: 8,
    //         icon: `/images/logos/udirdlaga.png`,
    //         component: 'ГАИ'
    //     },
    //     {
    //         name: 'Биеийн тамир, албаны бэлтгэлийн институт',
    //         active_id: 9,
    //         icon: `/images/logos/udirdlaga.png`,
    //         component: 'БТАБИ'
    //     },
    //     {
    //         name: 'Сургалтын бодлого, төлөвлөлтийн газар',
    //         active_id: 10,
    //         icon: `/images/logos/erh.png`,
    //         component: 'ЭЗНУС'
    //     },
    //     {
    //         name: 'ЭРХ ЗҮЙ, НИЙГМИЙН УХААНЫ СУРГУУЛЬ',
    //         active_id: 11,
    //         icon: `/images/logos/erh.png`,
    //         component: 'ЭЗНУС'
    //     },

    //     {
    //         name: 'Эрдэм шинжилгээний хүрээлэн',
    //         active_id: 12,
    //         icon: `/images/logos/ontsgoi.png`,
    //         component: 'ОБС'
    //     },
    //     {
    //         name: 'Ахлагчийн мэргэжлийн сургалт-үйлдвэрлэлийн төв',
    //         active_id: 13,
    //         icon: `/images/logos/amsvt.png`,
    //         component: 'АМСҮТ'
    //     },
        // {
        //     name: 'АХЛАХ СУРГУУЛЬ',
        //     active_id: 9,
        //     icon: `/images/logos/ahlah.png`,
        //     component: 'АС'
        // },
    // ]

    const salbarApi = useApi().browser

    async function getDatas() {

        const { success, data } = await fetchData(salbarApi.getSalbarData())
        if (success) {
            setDatas(data)

        }
    }
    useEffect(() => {
        getDatas()
    }, [])

    return (
        <Fragment>
            <Card>
                <CardHeader>
                    Хоосон
                </CardHeader>
            {/* <div className='d-flex flex-column' style={{ minHeight: '100vh' }}>
            <div className='container-fluid container-md' style={{ flex:1 }}>
                <div>
                    <div className=''>
                        <Row className='m-0 my-3 p-0'>
                                <div className=''>
                                {
                                    datas.map((val, idx) =>
                                        {
                                            return (
                                                <div key={idx}>
                                                    <div
                                                        className={`text-wrap d-flex align-items-center p-50 m-25 salbar_item `}
                                                        style={{ wordWrap:'break-word' }}
                                                        role='button'
                                                    >
                                                        <Accordion open={`accordion${open}`} toggle={() => toggle(idx+1)} key={idx}>
                                                            <AccordionItem className='m-1 shadow-sm' key={idx+1}>
                                                                <AccordionHeader targetId={`accordion${idx+1}`}>
                                                                    <span className='accordion_title_override text-uppercase'>
                                                                        {val?.sub_org_name}
                                                                    </span>
                                                                </AccordionHeader>
                                                                <AccordionBody accordionId={`accordion${idx+1}`}>
                                                                </AccordionBody>
                                                            </AccordionItem>
                                                        </Accordion>
                                                        <TabContent className='py-50 d-flex flex-wrap justify-content-center'  id=''>
                                                            {
                                                                // isLoading
                                                                // ?
                                                                //         <div className='w-100 d-flex justify-content-center align-items-center' style={{ minHeight: '40vh', zIndex: 9999 }}>
                                                                //             {Loader}
                                                                //         </div>
                                                                // :
                                                                val?.salbars.map((row, key) =>{
                                                                    return (
                                                                        <div key={idx}>

                                                                            <span className='text-uppercase' style={{ fontSize: 12, wordBreak: 'break-word' }}>
                                                                                {row.name}
                                                                            </span>
                                                                        </div>
                                                                    )
                                                                })
                                                            }
                                                        </TabContent>
                                                    </div>
                                                </div>
                                            )
                                        })
                                }
                                </div>
                        </Row>
                    </div>
                </div>
            </div>
        </div> */}
        </Card>
        </Fragment>
    )
}
export default Surgalt

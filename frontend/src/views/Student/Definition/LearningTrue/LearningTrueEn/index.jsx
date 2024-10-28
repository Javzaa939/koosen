
import React, { useEffect } from "react"
import { Row } from 'reactstrap'
import { useTranslation } from "react-i18next";

import './style.css'
import useLoader from '@hooks/useLoader';
import PrintError from "@src/components/PrintError";

export default function LearningTrueEn()
{
    const logo = require("@src/assets/images/logo/dxis_logo.png").default

    const datas = sessionStorage.getItem("student_data")? JSON.parse(sessionStorage.getItem("student_data")) : null;
    const listArr = sessionStorage.getItem("signature_data")? JSON.parse(sessionStorage.getItem("signature_data")) : null;

    console.log(listArr)
    // const studentId = datas["id"]
    const { t } = useTranslation()
    const { i18n } = useTranslation()

    const cyrillicToLatinMap = {
        'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'J',
        'З': 'Z', 'И': 'I', 'Й': 'I', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O',
        'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts',
        'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch', 'Ъ': '', 'Ы': 'I', 'Ь': '', 'Э': 'E', 'Ю': 'Yu',
        'Я': 'Ya', 'Ө' : 'U', "Ү" : "U",
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'j',
        'з': 'z', 'и': 'i', 'й': 'i', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
        'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
        'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'i', 'ь': '', 'э': 'e', 'ю': 'yu',
        'я': 'ya', 'ө' : 'u', "ү" : "u",
      };

       // Loader
    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: true})

      const getOrdinal = (number) => {
        const suffixes = ["th", "st", "nd", "rd"];
        const v = number % 100;
        return number + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
      };

      // Function to transliterate Cyrillic to Latin
      const transliterateCyrillicToLatin = (text) => {
        return text.split('').map(char => cyrillicToLatinMap[char] || char).join('');
      };

    useEffect(
        () =>
        {
            i18n.changeLanguage("en")
            window.onafterprint = function()
            {
                // window.close()
                // sessionStorage.removeItem("student_data")
                // sessionStorage.removeItem("signature_data")
            }
        },
        []
    )

    function imageLoaded()
    {
        if (Object.keys(datas).length != 0)
        {
            // setTimeout(() => window.print(), 1000)
        }
    }

    /** 1 => 01 болгох Format */
    const zeroFill = n => {
        return ('0' + n).slice(-2);
    }

    /* Монгол үсгийг англи үсэг болгох хэсэг*/
    function engVseg(vseg)
    {
        switch (vseg)
        {
            case 'А':
                return 'A'
            case 'Б':
                return 'B'
            case 'В':
                return 'V'
            case 'Г':
                return 'G'
            case 'Д':
                return 'D'
            case 'Е':
                return 'Ye'
            case 'Ё':
                return 'Yo'
            case 'Ж':
                return 'J'
            case 'З':
                return 'Z'
            case 'И':
                return 'I'
            case 'Й':
                return 'i'
            case 'К':
                return 'K'
            case 'Л':
                return 'L'
            case 'М':
                return 'M'
            case 'Н':
                return 'N'
            case 'О':
                return 'O'
            case 'Ө':
                return 'O'
            case 'П':
                return 'P'
            case 'Р':
                return 'R'
            case 'С':
                return 'S'
            case 'Т':
                return 'T'
            case 'У':
                return 'U'
            case 'Ү':
                return 'U'
            case 'Ф':
                return 'F'
            case 'Х':
                return 'Kh'
            case 'Ц':
                return 'Ts'
            case 'Ч':
                return 'Ch'
            case 'Ш':
                return 'Sh'
            case 'Ы':
                return 'I'
            case 'Ь':
                return 'I'
            case 'Э':
                return 'E'
            case 'Ю':
                return 'Yu'
            case 'Я':
                return 'Ya'
            default:
                break;
        }
    }

    if(datas) {
        return (
            <>
        <div className='ps-5 pe-4 d-flex flex-column justify-content-center align-items-center fontchange'>
                {
                    Object.keys(datas).length > 0
                    ?
                    <>
                        {isLoading && Loader}
                        <div className='d-flex flex-column justify-content-center align-items-center w-100 mt-3' style={{ fontSize: '14px' }} >
                            <img className="fallback-logo" width={100} height={100} src={logo} alt="logo" onLoad={imageLoaded} />
                            <div className="d-flex flex-column text-center fw-bolder">
                                {/* <span className='mt-1'>
                                    {datas?.school_data?.name?.toUpperCase()}
                                </span> */}
                                {/* <span style={{ marginTop: '6px' }}>{datas?.school_data?.name_eng.toUpperCase()}</span> */}
                                <span style={{ marginTop: '6px' }} className="text-uppercase">
                                    {/* {datas?.school_data?.name_eng?.toUpperCase()} */}
                                    University of internal affairs, mongolia
                                </span>
                            </div>
                        </div>
                        <Row className="pb-2 ps-1 pe-3 pt-1" style={{ fontSize: '14px' }} >
                            <div className="text-center mt-1">
                                {datas?.school?.address ? datas?.school?.address : 'Баянзүрх дүүрэг, VIII хороо Хилчний гудамж, ш/х - 210332, Улаанбаатар хот'}
                                <div>{datas?.school_data?.social && `E-mail: ${datas?.school_data?.social}`}</div>
                            </div>
                            <div className="text-center fst-italic">
                                _______________________________№_______________________________
                            </div>
                            <div className="text-center mt-1 fw-bolder fs-3">
                                CERTIFICATE OF STUDENT STATUS
                            </div>

                            <div className="text-center mt-2">
                            {
                                datas?.status_code == 1
                                ?
                                `This is to confirm that, ${transliterateCyrillicToLatin(datas?.first_name)} ${transliterateCyrillicToLatin(datas?.last_name)} /${engVseg(datas?.register_num[0])}${engVseg(datas?.register_num[1])}${datas?.register_num.slice(-8)}/ is a ${getOrdinal(datas?.group_level)} year student of ${datas?.profession_eng_name} program for the academic year of ${datas?.group_join_year}`

                                :
                                    datas?.status_code == 5
                                    ?
                                    `${datas?.code}: ${transliterateCyrillicToLatin(datas?.first_name)} ${transliterateCyrillicToLatin(datas?.last_name)} has successfully completed the ${datas?.degree_name} program at MSU. Their studies, specializing in ${datas?.group_name}, were conducted from ${datas?.group_join_year?.substring(0, 4)} to ${datas?.graduation_work ? datas?.graduation_work?.diplom_num?.substring(datas?.graduation_work?.diplom_num?.length - 4 ) : '2024'}. They have been verified to have completed their degree, obtaining diploma number ${datas?.graduation_work?.diplom_num}.`

                                    :
                                    `This document certifies that ${transliterateCyrillicToLatin(datas?.first_name)} ${transliterateCyrillicToLatin(datas?.last_name)}, identified by the code /${datas?.code} /, is ${t(datas?.status_name_eng?.toLowerCase())}. This certification is issued in accordance with university records and policies.`

                            }
                            </div>

                            <div className="text-center mt-3 text-uppercase">
                                {
                                    listArr.map((val, idx) =>
                                    {
                                        return (
                                            <p key={idx} >
                                                {val?.position_name_eng}: ........................................... /{val?.last_name_eng?.substring(0, 1)}.{val?.first_name_eng}/
                                            </p>
                                        )
                                    })
                                }
                            </div>
                        </Row>
                    </>
                    :
                    <p>Sorry, no information found</p>
                }
            </div>
            </>
        )
    } else {
        return(
            <PrintError/>
        )
    }
}

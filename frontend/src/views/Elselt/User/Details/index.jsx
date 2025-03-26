import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import { Book, ChevronsLeft, Download, Star, User, ArrowDown } from 'react-feather';
import { Badge, Col, Row, CardBody, Table, Collapse,Card,CardHeader} from 'reactstrap';

import './style.scss'
import moment from 'moment';

function Details() {

    const param = useParams()
    const id = param?.student
	const elseltApi = useApi().elselt.admissionuserdata

	const { Loader, isLoading, fetchData } = useLoader({isFullScreen: true, bg: 3, initValue: true});

    const [datas, setDatas] = useState()
	const [detailDatas , setDetailDatas] = useState()

	//Collapse
	const [isOpen, setIsOpen] = useState(new Array(6).fill(false));

	/* Жагсаалтын дата авах функц */
	async function getDatas() {

        const {success, data} = await fetchData(elseltApi.getOne(id))
        if(success) {
            setDatas(data)
			setDetailDatas(data)
        }
	}

    useEffect(() => {
        getDatas()
    }, [])

    function ftext(val) {

        if(val) {
            var text = val.split(`/`)[val.split('/').length - 1]

            var vdata = `${text?.substring(0, 27)}...${text?.substring(text?.length - 4)}`

            if(text.length > 30) {
                return vdata
            } else {
                return text
            }
        } else {
            console.warn('ftext функцыг хоосон дуудах шаардлага байхгүй !')
            return ''
        }
    }

	function textFnc(firstString='', lastString='', firstClassName='', twoClassName='')
    {
        return (
            <div className="d-flex align-items-center mt-50" style={{ lineHeight: 1 }}>
                <span className={`w-50 text-end me-25 ${firstClassName}`} style={{ fontSize: '13px', fontWeight: '500', color: '#4f4f4f' }}>{firstString}</span>
                <b className={`w-50 ms-25 ${twoClassName}`} style={{ color: 'black', fontSize: '13px' }}>{lastString}</b>
            </div>
        )
    }

	// Toggle collapse card
	const toggleCollapse = (index) => {
        setIsOpen(prevState => ({
            ...prevState,
            [index]: !prevState[index]
        }));
    };

	// Нийт тэнцсэн шалгуур тоолох
	function countChecksAndPassed() {
		let passedCount = 0;

		if (datas?.anhan_uzleg?.state === 2) {
			passedCount++;
		}
		if (datas?.mergejliin_uzleg?.state === 2) {
			passedCount++;
		}
		if (datas?.physque?.state === 2) {
			passedCount++;
		}
		if (datas?.mental) {
			passedCount++;
		}
		if (datas?.conversation?.state === 2) {
			passedCount++;
		}
		if (datas?.army?.state === 2) {
			passedCount++;
		}

		return passedCount;
	}

	const passedCount = countChecksAndPassed();


    return (
        <div style={{ minHeight: '80dvh' }}>
            <div className='d-flex align-items-center ms-1' role='button' onClick={() => {window.close()}}>
                <ChevronsLeft size={18}/> Буцах
            </div>
            {isLoading ?
                Loader
                :
                <>
                    <Col md={12}>
                        <div className='border shadow p-1 m-1 rounded-3'>
                            <div className='d-flex justify-content-between align-items-center'>
                                <div className='p-50'>
                                    <span className='text_prefixer'>Горилж буй мэргэжил:</span> {datas?.profession}
                                </div>
                                <div className='p-50'>
                                    <span>
                                        {datas?.degree_name}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Col>
                    <Row>
                        <Col md={6} sm={12}>
                            <div>
                                <div className='border shadow p-1 m-1 rounded-3'>
                                    <div className='d-flex justify-content-between'>
                                        <div className='d-flex align-items-end'>
                                            <User className=''/>
                                            <span style={{ fontSize: 16 }}>
                                                Хувийн мэдээлэл
                                            </span>
                                        </div>
										{datas?.state == 3 ? "" : 
											(
												<Badge
													className='d-flex align-items-center badge-glow p-0'
													pill
													color={`${datas?.state == 1 ? 'primary' : datas?.state == 2 ? 'success' : datas?.state == 3 ? 'danger' : 'primary'
													}`}
												>
													<span className='mx-75 mt-25'>
														{datas?.state_name}
													</span>
												</Badge>
											)
										}
                                    </div>
                                    <div className='mt-2'>
                                        <div className='p-50'>
                                            <span className='text_prefixer'>Овог: </span>{datas?.user?.last_name}
                                        </div>
                                        <div className='p-50'>
                                            <span className='text_prefixer'>Нэр: </span>{datas?.user?.first_name}
                                        </div>
                                        <div className='p-50'>
                                            <span className='text_prefixer'>Регистрийн дугаар</span>: {datas?.user?.register}
                                        </div>
										<div className='p-50'>
                                            <span className='text_prefixer'>Бүртгэлийн дугаар</span>: {datas?.user?.code}
                                        </div>
                                        <div className='p-50'>
                                            <span className='text_prefixer'>Утасны дугаар</span>: {datas?.user?.mobile}
                                        </div>
                                        <div className='p-50'>
                                            <span className='text_prefixer'>Яаралтай холбогдох:</span> {datas?.user?.parent_mobile}
                                        </div>
                                        <div className='p-50'>
                                            <span className='text_prefixer'>Имейл:</span> {datas?.user?.email}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {
                                datas?.profession_state !== 1
                                &&
                                <div>
                                    <div className='border shadow p-1 m-1 rounded-3'>
                                        <div className='d-flex justify-content-between'>
                                            <div className='d-flex align-items-end'>
                                                <Book className='me-50'/>
                                                <span style={{ fontSize: 16 }}>
                                                    Мэдээлэл
                                                </span>
                                            </div>
                                        </div>
                                        <div className='mt-2'>
										{
											datas?.admission !== 6
											?
											<>
                                            <div className='p-50'>
                                                <span className='text_prefixer'>Төгссөн сургууль:</span> {datas?.userinfo?.graduate_school}
                                            </div>
                                            <div className='p-50'>
                                                <span className='text_prefixer'>Мэргэжил:</span> {datas?.userinfo?.graduate_profession}
                                            </div>
											</>
											: null
										}
                                            <div className='p-50'>
                                                <span className='text_prefixer'>{datas?.admission === 6 ? <>Бүрэн дунд боловсролын гэрчилгээ</> : <>Голч</>}:</span> {datas?.userinfo?.gpa}
                                            </div>
										{
											datas?.admission !== 6
											?
                                            <div className='p-50 d-flex align-items-center'>
                                                <span className='text_prefixer me-50'>Дипломын хуулбар:</span>
                                                {
                                                    datas?.userinfo?.diplom_pdf
                                                        ?
                                                            <span className='text-primary d-flex align-items-center' role='button' onClick={() => {window.open(`${process.env.REACT_APP_SERVER_FILE_URL}${datas?.userinfo?.diplom_pdf}`)}}>
                                                                {ftext(datas?.userinfo?.emongolia_diplom_pdf)} <Download className='ms-25' size={14}/>
                                                            </span>
                                                        :
                                                            <span>
                                                                Файл байхгүй
                                                            </span>
                                                }
                                            </div>
											: null
										}
										{
											datas?.admission === 6
											?
                                            <div className='p-50 d-flex align-items-center'>
                                                <span className='text_prefixer me-50'>Бүрэн дунд боловсролын гэрчилгээний зураг:</span>
                                                {
                                                    datas?.userinfo?.other_file ?
                                                        <span className='text-primary d-flex align-items-center' role='button' onClick={() => {window.open(`${process.env.REACT_APP_SERVER_FILE_URL}${datas?.userinfo?.other_file}`)}}>
                                                            {ftext(datas?.userinfo?.other_file)} <Download className='ms-25' size={14}/>
                                                        </span>
                                                    :
                                                    <span>
                                                        Файл байхгүй
                                                    </span>
                                                }
                                            </div>
											:
											<>
                                            {
                                                (datas?.profession_state !== 2 && datas?.profession_state !== 1)
                                                &&
                                                <>
													<div className='p-50'>
														<span className='text_prefixer'>Ажиллаж байгаа байгууллагын нэр:</span> {datas?.userinfo?.work_organization}
													</div>
                                                    <div className='p-50'>
                                                        <span className='text_prefixer'>Албан тушаал:</span> {datas?.userinfo?.position_name}
                                                    </div>
                                                    <div className='p-50'>
                                                        <span className='text_prefixer'>Цол:</span> {datas?.userinfo?.tsol_name}
                                                    </div>
                                                </>
                                            }
											</>
										}
                                            <div className='p-50'>
                                                <span className='text_prefixer'>Бүртгүүлсэн огноо:</span> {moment(datas?.created_at).format('YYYY-MM-DD HH:MM:SS')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            }
                        </Col>
                        {
                            datas?.profession_state === 1
                            &&
                            <Col md={6} sm={12}>
                                <div className='border shadow p-1 m-1 rounded-3'>
                                    <div className='d-flex justify-content-between'>
                                        <div className='d-flex align-items-end'>
                                            <User className='me-50'/>
                                            <span style={{ fontSize: 16 }}>
                                                ЭШ оноо
                                            </span>
                                        </div>
                                    </div>
                                    <CardBody>
                                    {
                                        datas?.user_score?.map((data, cidx) =>
                                            <div key={cidx} className='my-50'>
                                                <div className="fw-bolder">{`${data?.year} ${data?.season_name} `}</div>
                                                <Table bordered size='sm' responsive>
                                                    <thead>
                                                        <tr style={{fontSize: '9px'}}>
                                                            <th style={{width: '80px'}}>№</th>
                                                            <th>Хичээл</th>
                                                            <th>Хэмжээст оноо</th>
                                                            <th>Анхны оноо</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {
                                                            data?.scores?.map((lesson, idx) =>
                                                                <tr key={idx}>
                                                                    <td>{idx + 1}</td>
                                                                    <td>{lesson?.lesson_name}</td>
                                                                    <td>{lesson?.scaledScore}</td>
                                                                    <td>{lesson?.raw_score}</td>
                                                                </tr>
                                                            )
                                                        }
                                                    </tbody>
                                                </Table>
                                            </div>
                                        )
                                    }
                                    </CardBody>
                                </div>
                            </Col>
                        }
                        {
                            <Col md={6} sm={12}>
                                {
                                    (datas?.degree_code === "E" || datas?.degree_code === "F")
                                    &&
                                    <div className='border shadow p-1 m-1 rounded-3'>
                                        <div className='d-flex justify-content-between'>
                                            <div className='d-flex align-items-end'>
                                                <Star className='me-50'/>
                                                <span style={{ fontSize: 16 }}>
                                                    Нэмэлт мэдээлэл
                                                </span>
                                            </div>
                                        </div>
                                        <div className='mt-2'>
                                            {/* <div className='p-50 d-flex align-items-center'>
                                                <span className='text_prefixer me-50'>Эссэ бичсэн файл:</span>
                                                {
                                                    datas?.userinfo?.esse_pdf ?
                                                        <span className='text-primary d-flex align-items-center' role='button' onClick={() => {window.open(`${process.env.REACT_APP_SERVER_FILE_URL}${datas?.userinfo?.esse_pdf}`)}}>
                                                            {ftext(datas?.userinfo?.esse_pdf)} <Download className='ms-25' size={14}/>
                                                        </span>
                                                    :
                                                    <span>
                                                        Файл байхгүй
                                                    </span>
                                                }
                                            </div> */}
                                            <div className='p-50 d-flex align-items-center'>
                                                <span className='text_prefixer me-50'>Судалгааны ажил файл:</span>
                                                {
                                                    datas?.userinfo?.other_file ?
                                                        <span className='text-primary d-flex align-items-center' role='button' onClick={() => {window.open(`${process.env.REACT_APP_SERVER_FILE_URL}${datas?.userinfo?.other_file}`)}}>
                                                            {ftext(datas?.userinfo?.other_file)} <Download className='ms-25' size={14}/>
                                                        </span>
                                                    :
                                                    <span>
                                                        Файл байхгүй
                                                    </span>
                                                }
                                            </div>
                                            <div className='p-50 d-flex align-items-center'>
                                                <span className='text_prefixer me-50'>Төрийн албан хаагчийн анкет файл:</span>
                                                {
                                                    datas?.userinfo?.anket_file ?
                                                        <span className='text-primary d-flex align-items-center' role='button' onClick={() => {window.open(`${process.env.REACT_APP_SERVER_FILE_URL}${datas?.userinfo?.anket_file}`)}}>
                                                            {ftext(datas?.userinfo?.anket_file)} <Download className='ms-25' size={14}/>
                                                        </span>
                                                    :
                                                    <span>
                                                        Файл байхгүй
                                                    </span>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                }
								<Card style={{ borderRadius: "30px" }} className='mt-1 mx-1'>
									<CardHeader className={`mb-1 py-50 d-flex justify-content-between bg-primary align-items-center`}>
										<div className="d-flex justify-content-between w-100 align-items-center">
											<h4 className="text-white m-0">Шалгуур</h4>
											<h5 className="text-white m-0">{passedCount} / 6 </h5>
										</div>
									</CardHeader>
									<CardBody>
										{datas?.state == 3 ? (
											<>
												<div className='d-flex align-items-center'>
													<span className='text_prefixer'>Ерөнхий шалгуурын төлөв:</span>
													<span className='ms-1'>
														<Badge
															className='d-flex align-items-center badge-glow p-0'
															pill
															color={`${datas?.state == 1 ? 'primary' : datas?.state == 2 ? 'success' : datas?.state == 3 ? 'danger' : 'primary'
															}`}
															style={{height: "20px"}}
														>
															<span className='mx-75 mt-25'>
																{datas?.state_name}
															</span>
														</Badge>
													</span>
												</div>
												<div className='d-flex' style={{marginTop: "10px"}}>
													<p className='text_prefixer'>Тайлбар:</p>
													<p className='ms-1'>{datas?.state_description}</p>
												</div>
											</>
										) : ""}
										{datas?.anhan_uzleg && (
											<div className="border p-50 w-100 my-50 bg-secondary-subtle "  style={{ borderRadius: "30px" }}>
												<div className="d-flex justify-content-between" onClick={() => toggleCollapse(0)}>
													<h5 className="text-primary m-0 ms-1" >Эрүүл мэнд анхан</h5>
													<div className="d-flex gap-2">
														<b className={`w-50 ms-25`}	style={{ color: "black", fontSize: "13px" }}>
															{datas?.anhan_uzleg?.state == 2 ? (
															<Badge color="success" className="badge-glow">
																Тэнцсэн
															</Badge>
															) : datas?.anhan_uzleg?.state == 3 ? (
															<Badge color="danger" className="badge-glow">
																Тэнцээгүй
															</Badge>
															) : (
															<Badge color="primary" className="badge-glow">
																Бүртгүүлсэн
															</Badge>
															)}
														</b>
														<div className={`arrow-icon ${isOpen[0] ? 'rotated' : ''}`}>
															<ArrowDown className="cursor-pointer" />
														</div>
													</div>
												</div>
												<Collapse isOpen={isOpen[0]} className="bg-light " style={{ borderRadius: "30px" }} >
													<div className="py-1">
															{textFnc(
																"Өндөр:",
																detailDatas?.anhan_uzleg?.height
															)}
															{textFnc(
																"Жин:",
																detailDatas?.anhan_uzleg?.weight
															)}
															{textFnc(
																"Шарх сорвитой:",
																detailDatas?.anhan_uzleg?.is_chalk ? "Тийм" : "Үгүй"
															)}
															{textFnc(
																"Шивээстэй эсэх:",
																detailDatas?.anhan_uzleg?.is_tattoo ? "Тийм" : "Үгүй"
															)}
															{textFnc(
																"Мансууруулах эм, сэтгэцэд нөлөөт бодисын хамаарлын шинжилгээ:",
																detailDatas?.anhan_uzleg?.is_drug ? "Эерэг" : "Сөрөг"
															)}
															{textFnc(
																"Тайлбар:",
																detailDatas?.anhan_uzleg?.description
															)}
													</div>
												</Collapse>
											</div>)
										}
										{ (
											<div className="border p-50 w-100 my-50 bg-secondary-subtle "  style={{ borderRadius: "30px" }}>
												<div className="d-flex justify-content-between" onClick={() => toggleCollapse(1)}>
													<h5 className="text-primary m-0 ms-1" >Эрүүл мэнд мэргэжлийн</h5>
													<div className="d-flex gap-2 align-items-center">
														<b className={`w-50 ms-25`} style={{ color: "black", fontSize: "13px" }}>
															{datas?.mergejliin_uzleg?.state == 2 ? (
															<Badge color="success" className="badge-glow">
																Тэнцсэн
															</Badge>
															) : datas?.mergejliin_uzleg?.state == 3 ? (
																<Badge color="danger" className="badge-glow">
																	Тэнцээгүй
																</Badge>
															) : (
																<Badge color="primary" className="badge-glow">
																	Бүртгүүлсэн
																</Badge>
															)}
														</b>
														<div className={`arrow-icon ${isOpen[1] ? 'rotated' : ''}`}>
															<ArrowDown className="cursor-pointer" />
														</div>
													</div>
												</div>
												<Collapse isOpen={isOpen[1]} className="bg-light" style={{ borderRadius: "30px" }} >
													<div className="py-1">
														{textFnc(
															"Дотор:",
															detailDatas?.mergejliin_uzleg?.belly
														)}
														{textFnc(
															"Мэдрэл:",
															detailDatas?.mergejliin_uzleg?.nerve
														)}
														{textFnc(
															"Чих хамар хоолой:",
															detailDatas?.mergejliin_uzleg?.ear_nose
														)}
														{textFnc(
															"Нүд:",
															detailDatas?.mergejliin_uzleg?.eye
														)}
														{textFnc(
															"Шүд:",
															detailDatas?.mergejliin_uzleg?.teeth
														)}
														{textFnc(
															"Мэс засал:",
															detailDatas?.mergejliin_uzleg?.surgery
														)}
														{textFnc(
															"Эмэгтэйчүүд:",
															detailDatas?.mergejliin_uzleg?.femini
														)}
														{textFnc(
															"Зүрх судас:",
															detailDatas?.mergejliin_uzleg?.heart
														)}
														{textFnc(
															"сүрьеэ:",
															detailDatas?.mergejliin_uzleg?.phthisis
														)}
														{textFnc(
															"арьс харшил:",
															detailDatas?.mergejliin_uzleg?.allergies
														)}
														{textFnc(
															"халдварт өвчин:",
															detailDatas?.mergejliin_uzleg?.contagious
														)}
														{textFnc(
															"сэтгэц мэдрэл:",
															detailDatas?.mergejliin_uzleg?.neuro_phychic
														)}
														{textFnc(
															"гэмтэл:",
															detailDatas?.mergejliin_uzleg?.injury
														)}
														{textFnc(
															"БЗДХ:",
															detailDatas?.mergejliin_uzleg?.bzdx
														)}
														{textFnc(
															"Тайлбар:",
															detailDatas?.mergejliin_uzleg?.description
														)}
													</div>
												</Collapse>
											</div>
										)}
										{datas?.physque && (
											<div className="border p-50 w-100 my-50 bg-secondary-subtle" style={{ borderRadius: "30px" }}>
											<div className="d-flex justify-content-between" onClick={() => toggleCollapse(2)}>
												<h5 className="text-primary m-0 ms-1" >Бие бялдар</h5>
												<div className="d-flex gap-2">
													<b className={`w-50 ms-25`} style={{ color: "black", fontSize: "13px" }}>
														{datas?.physque?.state == 2 ? (
														<Badge color="success" className="badge-glow">
															Тэнцсэн
														</Badge>
														) : datas?.physque?.state == 3 ? (
														<Badge color="danger" className="badge-glow">
															Тэнцээгүй
														</Badge>
														) : (
														<Badge color="primary" className="badge-glow">
															Бүртгүүлсэн
														</Badge>
														)}
													</b>
													<div className={`arrow-icon ${isOpen[2] ? 'rotated' : ''}`}>
															<ArrowDown className="cursor-pointer" />
													</div>
												</div>
											</div>
											<Collapse isOpen={isOpen[2]} className="bg-light" style={{ borderRadius: "30px" }} >
												<div className="py-1">
													{textFnc(
														"Савлуурт суниах:",
														detailDatas?.physque?.turnik
													)}
													{textFnc(
														"Гэдэсний таталт:",
														detailDatas?.physque?.belly_draught
													)}
													{textFnc(
														"Тэсвэр 1000 м:",
														detailDatas?.physque?.patience_1000m
													)}
													{textFnc(
														"Хурд 100 м:",
														detailDatas?.physque?.speed_100m
													)}
													{textFnc(
														"Авхаалж самбаа:",
														detailDatas?.physque?.quickness
													)}
													{textFnc(
														"Уян хатан:",
														detailDatas?.physque?.flexible
													)}
													{textFnc(
														"Нийт оноо:",
														detailDatas?.physque?.total_score
													)}
													{textFnc(
														"Тайлбар:",
														detailDatas?.physque?.description
													)}
												</div>
											</Collapse>
										</div>
										)}
										{datas?.mental && (
											<div className="border p-50 w-100 my-50 bg-secondary-subtle "  style={{ borderRadius: "30px" }}>
												<div className="d-flex justify-content-between" onClick={() => toggleCollapse(3)}>
													<h5 className="text-primary m-0 ms-1" >Сэтгэлзүйн сорил</h5>
													<div className="d-flex gap-2">
														<b className={`w-50 ms-25`} style={{ color: "black", fontSize: "13px" }}>
																{datas?.mental && (
																<Badge color="success" className="badge-glow">
																	Тэнцсэн
																</Badge>
																)}
															</b>
														<div className={`arrow-icon ${isOpen[3] ? 'rotated' : ''}`}>
															<ArrowDown className="cursor-pointer" />
														</div>
													</div>
												</div>
												<Collapse isOpen={isOpen[4]} className="bg-light" style={{ borderRadius: "30px" }} >
													<div className="py-1">
														{textFnc(
															"Оноо:",
															detailDatas?.mental?.score
														)}
														{textFnc(
															"Тайлбар:",
															detailDatas?.mental?.description
														)}
													</div>
												</Collapse>
											</div>
										)}
										{datas?.conversation && (
											<div className="border p-50 w-100 my-50 bg-secondary-subtle "  style={{ borderRadius: "30px" }}>
												<div className="d-flex justify-content-between" onClick={() => toggleCollapse(4)}>
													<h5 className="text-primary m-0 ms-1" >Ярилцлага</h5>
													<div className="d-flex gap-2">
														<b className={`w-50 ms-25`} style={{ color: "black", fontSize: "13px" }}>
															{datas?.conversation?.state == 2 ? (
																<Badge color="success" className="badge-glow">
																	Тэнцсэн
																</Badge>
															) : datas?.conversation?.state == 3 ? (
																<Badge color="danger" className="badge-glow">
																	Тэнцээгүй
																</Badge>
															) : datas?.conversation?.state == 1 ? (
																<Badge color="primary" className="badge-glow">
																	Нөхцөлтэй
																</Badge>
															) : (
																<Badge color="primary" className="badge-glow">
																	Ороогүй
																</Badge>
															)
															}
														</b>
														<div className={`arrow-icon ${isOpen[4] ? 'rotated' : ''}`}>
															<ArrowDown className="cursor-pointer" />
														</div>
													</div>
												</div>
												<Collapse isOpen={isOpen[5]} className="bg-light" style={{ borderRadius: "30px" }} >
													<div className="py-1">
														{textFnc(
															"Тайлбар:",
															detailDatas?.conversation?.description
														)}
													</div>
												</Collapse>
											</div>
										)}
										{datas?.army && (
											<div className="border p-50 w-100 my-50 bg-secondary-subtle "  style={{ borderRadius: "30px" }}>
												<div className="d-flex justify-content-between" onClick={() => toggleCollapse(5)}>
													<h5 className="text-primary m-0 ms-1" >Цэргийн хээрийн бэлтгэл ярилцлага</h5>
													<div className="d-flex">
															<span
															className={`w-50 text-end me-25`}
															style={{
																fontSize: "13px",
																fontWeight: "500",
																color: "#4f4f4f",
															}}
															>
															Төлөв:
															</span>
															<b
															className={`w-50 ms-25`}
															style={{ color: "black", fontSize: "13px" }}
															>
															{datas?.army?.state == 2 ? (
																<Badge color="success" className="badge-glow">
																Тэнцсэн
																</Badge>
															) : datas?.army?.state == 3 ? (
																<Badge color="danger" className="badge-glow">
																Тэнцээгүй
																</Badge>
															) : (
																<Badge color="primary" className="badge-glow">
																Бүртгүүлсэн
																</Badge>
															)}
															</b>
															<div className={`arrow-icon ${isOpen[5] ? 'rotated' : ''}`}>
																<ArrowDown className="cursor-pointer" />
															</div>
													</div>
												</div>
												<Collapse isOpen={isOpen[6]} className="bg-light" style={{ borderRadius: "30px" }} >
													<div className="py-1">
														{textFnc(
															"Тайлбар:",
															detailDatas?.army?.description
														)}
													</div>
												</Collapse>
											</div>
										)}
									</CardBody>
            					</Card>
                            </Col>
                        }
                    </Row>
                </>
            }
        </div>
    )
}

export default Details

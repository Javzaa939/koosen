import React, { useState } from 'react'
import { AlertCircle, ArrowRight, User, Users } from 'react-feather'
import { Button, Card, Modal} from 'reactstrap'
import { useNavigate } from "react-router-dom"
import classnames from "classnames"
// import './style.scss'

function ProDetailAccordion({ detail, chosenSchool, state}) {
	const navigate = useNavigate()

	// const [posterModal, setPosterModal] = useState(false)

	// function handlePosterModal() {
	// 	setPosterModal(!posterModal)
	// }

	return (
		<div className={`w-100 h-100`}>
			<Card className='d-flex mt-2 mx-2 detail_style' style={{ minHeight: 200 }}>
				<div className='w-100 d-flex justify-content-between flex-wrap'>
					<div className='p-1' style={{ fontSize: 14 }}>
						{
							detail?.name
							?
							<div className='mb-1 d-flex flex-column'>
								<div className="hynalt_card border my-25 d-inline-block rounded-3">
									<div className="p-50 fw-bolder fs-5 pb-0">
										Хяналтын тоо
									</div>
									<div className="d-flex flex-wrap px-1" style={{ maxWidth: '500px' }}>
										<div className='p-0 genders_info'>
											<div className="hynalt_card_content border rounded-3 pb-0 shadow-sm d-flex gap-1 align-items-center">
												<Users size={18} color="#00265c"/>
												<div>
													<div className="card_content_title">
														Нийт
													</div>
													<h4>
														{detail?.hynal_too?.all || 0}
													</h4>
												</div>
											</div>
										</div>
										<div className='p-0 genders_info'>
											<div className="hynalt_card_content border rounded-3 pb-0 shadow-sm d-flex gap-1 align-items-center">
												<User color="#88b1eb"/>
												<div>
													<div className="card_content_title">
														Эрэгтэй
													</div>
													<h4>
														{detail?.hynal_too?.men || 0}
													</h4>
												</div>
											</div>
										</div>
										<div className='p-0 genders_info'>
											<div className="hynalt_card_content border rounded-3 pb-0 shadow-sm d-flex gap-1 align-items-center">
												<User color="#e998eb"/>
												<div>
													<div className="card_content_title">
														Эмэгтэй
													</div>
													<h4>
														{detail?.hynal_too?.women || 0}
													</h4>
												</div>
											</div>
										</div>
									</div>
								</div>

								<div className="hynalt_card border my-25 d-inline-block rounded-3">
									<div className="p-50 pb-0 fw-bolder fs-5">
										Бүртгүүлсэн
									</div>
									<div className="d-flex flex-wrap px-1" style={{ maxWidth: '500px' }}>
										<div className='p-0 genders_info'>
											<div className="hynalt_card_content border rounded-3 pb-0 shadow-sm d-flex gap-1 align-items-center">
												<Users size={18} color="#00265c"/>
												<div>
													<div className="card_content_title">
														Нийт
													</div>
													<h4>
														{detail?.hynal_too?.register_count || 0 }
													</h4>
												</div>
											</div>
										</div>
										<div className='p-0 genders_info'>
											<div className="hynalt_card_content border rounded-3 pb-0 shadow-sm d-flex gap-1 align-items-center">
												<User color="#88b1eb"/>
												<div>
													<div className="card_content_title">
														Эрэгтэй
													</div>
													<h4>
														{detail?.hynal_too?.male_count || 0 }
													</h4>
												</div>
											</div>
										</div>
										<div className='p-0 genders_info'>
											<div className="hynalt_card_content border rounded-3 pb-0 shadow-sm d-flex gap-1 align-items-center">
												<User color="#e998eb"/>
												<div>
													<div className="card_content_title">
														Эмэгтэй
													</div>
													<h4>
														{detail?.hynal_too?.female_count || 0 }
													</h4>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
							:
							<div>
								<h5>{detail?.introduction ? detail?.introduction : detail?.name}</h5>
							</div>
						}

						{/* Шаардлагууд */}

						<ul
							className={classnames("timeline")}
							>
							{detail?.base_requirements.map((item, i) => {
								const ItemTag = item.tag ? item.tag : "li"
								return (
									<ItemTag
										key={i}
										className={classnames("timeline-item ps-2")}
									>
										<span
											className={classnames("timeline-point", {
												[`timeline-point-${item.color}`]: item.color,
												"timeline-point-indicator": !item.icon
											})}
										>
										</span>
										<div className="timeline-event">
										<div
											className={classnames(
												"d-flex justify-content-between flex-sm-row flex-column mb-sm-0 mb-1"
											)}
										>
											<h6>{item.title}</h6>
										</div>
											{item.datas
											?
											<div className='d-flex flex-column'>
												{
													item?.datas?.map((value, idx) =>
													{
														return (
															<span key={idx}><AlertCircle size={13} className='me-50'/>{value?.name}</span>
														)
													}

													)
												}
											</div>
											: null
											}
										</div>
									</ItemTag>
								)
							})}
						</ul>
						{/* Дэлгэрэнгүй мэдээлэл */}
					</div>
					{
							<div className=''>
								<div className='pt-3 pb-2 mx-2 text-center'>
									<Button color='primary' onClick={() => {navigate(`${(state === 1 || state === 4) ? '/register-form/yesh' : '/register-form'}`, { state: {chosen_profs: detail, chosen_school: chosenSchool, stype: state} })}}>
										Бүртгүүлэх <ArrowRight size={15} className='ms-25'/>
									</Button>
								</div>
							</div>
					}
				</div>
			</Card>
			<Modal centered isOpen={posterModal} backdropClassName='backdrop_override' toggle={handlePosterModal} size='xl'>
				<img src='/assets/pics/posters/tsagdaa_poster.jpg' className='w-100 h-100' onClick={() => handlePosterModal()}/>
			</Modal>
		</div>
	)
}

export default ProDetailAccordion


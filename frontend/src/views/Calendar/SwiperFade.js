import { Swiper, SwiperSlide } from 'swiper/react/swiper-react'
import { useRTL } from '@hooks/useRTL'
import { Button } from 'reactstrap'

import SwiperCore, {
  Grid,
  Lazy,
  Virtual,
  Autoplay,
  Navigation,
  Pagination,
  EffectFade,
  EffectCube,
  EffectCoverflow
} from 'swiper'

import '@styles/react/libs/swiper/swiper.scss'
SwiperCore.use([Navigation, Grid, Pagination, EffectFade, EffectCube, EffectCoverflow, Autoplay, Lazy, Virtual])

const SwiperFade = ({ datas }) => {
  	const [isRtl] = useRTL()

	const params = {
		pagination: {
			clickable: true
		},
	}

	return (
		<Swiper {...params} dir={isRtl ? 'rtl' : 'ltr'}>
			{
				datas.map((data, idx) =>
				{
					return (
						<SwiperSlide key={idx}>
							{
								data?.image
								&&
									<img width={400} height ={400} style={{ textAlign: 'center', objectFit:'cover' }} src={data?.image ? data?.image : null}></img>
							}
							<h4 className='mt-1'>{data?.title}</h4>
							<div className='mb-4 mt-1 '>
								<Button
									color='primary'
									outline
									id={`complaintListDatatableDetail${data?.id}`}
									className='ms-1'
									href={`../service/show/${data?.id}`}
									target={'_blank'}
								>
									Дэлгэрэнгүй
								</Button>
							</div>
						</SwiperSlide>
					)
				})
			}
		</Swiper>
	)
}

export default SwiperFade

import { Button } from 'reactstrap';
import '../../style.scss';
import { QUIZ } from '../../utils';

export default function OnlineSubInfoBlock({
	t,
	datas = [],
	handleSelectOnlineSubInfo,
	onlineInfoTitle
}) {
	return datas.map((onlineSubInfosItem, onlineSubInfosInd) => {
		const { title, quezquestions_count, file_type_name, file_type } = onlineSubInfosItem

		return <Button
			key={onlineSubInfosInd}
			color='Link'
			className="d-flex flex-column p-50 w-100"
			onClick={() => handleSelectOnlineSubInfo(onlineSubInfosItem, onlineInfoTitle)}
		>
			<span className="h5 mb-50">{title}</span>
			<span className="text-body fw-normal">
				{
					file_type === QUIZ ?
						`${0} / ${quezquestions_count} ${t('асуултууд')}`
						:
						file_type_name
				}
			</span>
		</Button>
	})
}

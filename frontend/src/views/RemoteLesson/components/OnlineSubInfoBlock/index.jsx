import '../../style.scss';

export default function OnlineSubInfoBlock({
	t,
	datas = [],
}) {
	return datas.map((onlineSubInfositem, onlineSubInfos_ind) => {
		const { title, quezquestions_count, file_type_name } = onlineSubInfositem

		return <span key={onlineSubInfos_ind} className="d-flex flex-column">
			<span className="h5 mb-0">{title}</span>
			<span className="text-body fw-normal">{0} / {quezquestions_count} {t('асуултууд')} | {file_type_name}</span>
		</span>
	})
}
import { Badge, Card, CardBody } from 'reactstrap';
import '../../style.scss';
import DisplayQuill from '../DisplayQuill';
import { PDF, QUIZ, TEXT, VIDEO } from '../../utils';
import QuizBlock from '../QuizBlock';

export default function OnlineSubInfoDetailsBlock({
	t,
	selectedOnlineSubInfo,
}) {
	const { onlineSubInfoData, onlineInfoTitle } = selectedOnlineSubInfo || {}
	const { title, file_path, file_type, text } = onlineSubInfoData || {}

	return (
		<Card>
			<CardBody>
				<div className="d-flex justify-content-between align-items-center flex-wrap mb-2 gap-2">
					<div className="me-1">
						<h5 className="mb-0">{title}</h5>
					</div>
					<div className="d-flex align-items-center text-black">
						<Badge color="danger" className="bg-label-danger">
							{onlineInfoTitle}
						</Badge>
					</div>
				</div>
				<div className="card shadow-none border">
					<CardBody className='d-flex justify-content-center'>
						{
							file_type === TEXT ?
								text && <DisplayQuill content={text} />
								:
								file_type === VIDEO ?
									<video
										controls
										src={file_path}
										width={"90%"}
										height={'350px'}
										className='justify-content-center'
									>
										{t('Видео тоглуулахад алдаа гарлаа')}.
									</video>
									:
									file_type === PDF ?
										<iframe src={file_path} width="100%" height="640" allowFullScreen frameBorder="0" style={{ border: 'none' }}></iframe>
										:
										file_type === QUIZ ?
											<QuizBlock
												onlineSubInfoData={onlineSubInfoData}
												t={t}
											/>
											:
											t('Дэд бүлэг сонгоно уу')
						}
					</CardBody>
				</div>
			</CardBody>
		</Card>
	)
}
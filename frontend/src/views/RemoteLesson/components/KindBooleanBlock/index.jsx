import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Col, Input, Label, Row } from "reactstrap";

export default function KindBooleanBlock({
	control,
	name,
}) {
	const { t } = useTranslation()

	return (
		<Controller
			control={control}
			name={name}
			render={({ field: { ref, ...rest } }) => {
				return (
					<>
						<Row>
							<Col>
								<Input
									{...rest}
									className='me-1'
									type='radio'
									value={1}
									id={`${rest.name}-1`}
									checked={rest.value === '1'}
								/>
								<Label className='form-label' for={`${rest.name}-1`}>
									{t('Тийм')}
								</Label>
							</Col>
						</Row>
						<Row>
							<Col>
								<Input
									{...rest}
									className='me-1'
									type='radio'
									value={0}
									id={`${rest.name}-2`}
									checked={rest.value === '0'}
								/>
								<Label className='form-label' for={`${rest.name}-2`}>
									{t('Үгүй')}
								</Label>
							</Col>
						</Row>
					</>
				)
			}}
		/>
	)
}
import { UploadCloud, X } from "react-feather";
import classnames from "classnames";
import { Label } from "reactstrap";
import '@styles/react/libs/flatpickr/flatpickr.scss';

/*
example parent:
	<Controller
		control={control}
		defaultValue=''
		name={inputNameFile}
		render={({ field: { ref, ...rest } }) => {
			return (
				<Row className='mt-1'>
					<Col md={6} className='text-end'>
						<Input
							className='me-1'
							type='radio'
							value={`${rest.name}-file`}
							name={`${rest.name}-file_source`}
							id={`${rest.name}-file`}
							checked={radioFileType === `${rest.name}-file`}
							onChange={(e) => { setRadioFileType(e.target.value) }}
						/>
						<Label className='form-label' for={`${rest.name}-file`}>
							{t('Файл сонгох')}
						</Label>
					</Col>
					<Col md={6} className='text-start'>
						<Input
							className='me-1'
							type='radio'
							value={`${rest.name}-url`}
							name={`${rest.name}-file_source`}
							id={`${rest.name}-url`}
							checked={radioFileType === `${rest.name}-url`}
							onChange={(e) => { setRadioFileType(e.target.value) }}
						/>
						<Label className='form-label' for={`${rest.name}-url`}>
							{t('URL хаяг')}
						</Label>
					</Col>
					<Col md={12}>
						{radioFileType === `${rest.name}-file` ?
							<InputFile
								{...rest}
								placeholder={t('Файл сонгоно уу')}
								errors={errors}
								onChange={(e) => {
									rest.onChange(e?.target?.files?.[0] ?? '')
								}}
								accept={formValues[inputNameFileType] === VIDEO ? 'video/*' : 'application/pdf'}
								warning={formValues[inputNameFileType] === VIDEO ? 'Файл оруулна уу. Зөвхөн VIDEO файл хүлээж авна' : 'Файл оруулна уу. Зөвхөн .pdf файл хүлээж авна'}
							/>
							:
							<Input
								{...rest}
								type='text'
								id={rest.name}
								bsSize='sm'
								placeholder={t('URL хаяг')}
								invalid={errors[rest.name] && true}
							/>
						}
					</Col>
				</Row>
			)
		}}
	></Controller>
*/

export default function InputFile({
	value,
	onChange,
	name,
	className = '',
	accept = "application/pdf",
	placeholder,
	errors,
	warning = 'Файл оруулна уу. Зөвхөн .pdf файл хүлээж авна',
	...rest
}) {

	function ftext(val) {
		var text = val.split(`/`)[val.split('/').length - 1]
		var vdata = `${text?.substring(0, 27)}...${text?.substring(text?.length - 4)}`
		return vdata
	}

	return (
		<div className="dropzone-container">
			<input
				{...rest}
				id={name}
				name={name}
				multiple={false}
				type='file'
				className={`d-none ${className}`}
				accept={accept}
				placeholder={placeholder}
				onChange={(e) => { onChange(e) }}
				onError={() => { 'Алдаа' }}
			/>
			<Label className={`${value ? 'border-success' : 'border'} rounded-3 ${classnames({ 'is-invalid': errors[name] })}`} htmlFor={name}>
				<div>
					<div className='mt-2 mb-1 d-flex flex-column align-items-center justify-content-center'>
						<UploadCloud color={`${errors[name] ? '#c72e2e' : 'gray'}`} size={60} />
						<span className={`mx-1 px-1 ${errors[name] ? 'text-danger' : ''}`} style={{ fontSize: 12 }}>
							{warning}
						</span>
					</div>
				</div>
				<div>
					{
						value ?
							<div className='p-50 d-flex justify-content-between file_style'>
								<div className='text-truncate fw-bold'>
									{typeof value == 'string' ? ftext(value) :
										value?.name?.length > 30 ?
											`${value?.name?.substring(0, 27)}...${value?.name?.substring(value?.name?.length - 4)}` :
											value?.name
									}
								</div>
								<div>
									<X onClick={(e) => { e.preventDefault(), onChange('') }} size={16} role='button' />
								</div>
							</div>
							:
							<div>
							</div>
					}
				</div>
			</Label>
		</div>
	)
}
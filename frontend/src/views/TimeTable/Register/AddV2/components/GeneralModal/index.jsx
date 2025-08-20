import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap'

export default function GeneralModal({
	isOpen,
	toggle,
	size = 'sm',
	title = '',
	BodyComponent,
	bodyComponentProps,
	buttonText = '',
	buttonOnClick = () => null,
	isDisabled,
	buttonLink
}) {
	return (
		<Modal isOpen={isOpen} toggle={toggle} centered={true} size={size}>
			<ModalHeader toggle={toggle}>{title}</ModalHeader>
			<ModalBody>{<BodyComponent {...bodyComponentProps} />}</ModalBody>
			<ModalFooter>
				{
					buttonLink
						?
						<Button color="primary" tag="a" href={buttonLink} download disabled={isDisabled}>{buttonText}</Button>
						:
						<Button color="primary" onClick={buttonOnClick} disabled={isDisabled}>{buttonText}</Button>
				}
			</ModalFooter>
		</Modal>
	)
}

import '../style.css'

export const Switcher = ({ label = '', setIsOn, isOn }) => {
	const toggle = () => setIsOn(!isOn);

	return (
		<div className="toggle-container text-primary order-1 me-auto">
			<div className={`toggle-switch ${isOn ? 'on' : ''}`} onClick={toggle}>
				<div className="toggle-circle" />
			</div>
			{label && <span className="toggle-label text-primary fs-6">{label}</span>}
		</div>
	)
}
// ** Logo
import whitelogo from "@assets/images/logo/logo-white-compressed.png";
import logo from "@assets/images/logo/logo-muis.png";
import './medstyle.scss'

const MedSpinn = () => {
	return (
		<div className="background-glassmd">
			<div className="fallback-spinnermd app-loadermd background-lightmd position-relative">
				<img className="fallback-logomd position-absolute top-50 start-50 translate-middle " src={window.localStorage.skin === '"dark"' ? whitelogo : logo} alt="logo" style={{ width: 50 }}/>
				<div className="loadingmd position-absolute top-50 start-50 translate-middle">
					<div className="effect-1md effectsmd"></div>
					<div className="effect-2md effectsmd"></div>
					<div className="effect-3md effectsmd"></div>
				</div>
			</div>
		</div>
	)
};

export default MedSpinn;

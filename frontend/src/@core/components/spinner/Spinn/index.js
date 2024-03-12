// ** Logo
import whitelogo from "@assets/images/logo/logo-white-compressed.png";
import logo from "@src/assets/images/logo/dxis_logo.png";
import './fstyle.scss'


const Spinn = ({bg}) => {
	if(bg === 1) {
		return (
			<div className="d-flex justify-content-center align-items-center background-glassf w-100 h-100">
				<div className="fallback-spinnerf app-loaderf background-lightf  position-absolute top-50 start-50 translate-middle ">
					<img className="fallback-logof  position-absolute top-50 start-50 translate-middle " src={window.localStorage.skin === '"dark"' ? whitelogo : logo} alt="logo"/>
					<div className="loadingf  position-absolute top-50 start-50 translate-middle ">
						<div className="effect-1f effectsf"></div>
						<div className="effect-2f effectsf"></div>
						<div className="effect-3f effectsf"></div>
					</div>
				</div>
			</div>
			)
		} else if(bg === 2) {
			return(
				<div className="d-flex justify-content-center align-items-center mt-5 background-glassf top-50 start-50 translate-middle rounded-5 shadow" style={{ width: '80vw', height: '70vh' }}>
					<div className="fallback-spinnerf app-loaderf background-lightf  position-absolute top-50 start-50 translate-middle ">
						<img className="fallback-logof  position-absolute top-50 start-50 translate-middle " src={window.localStorage.skin === '"dark"' ? whitelogo : logo} alt="logo"/>
						<div className="loadingf  position-absolute top-50 start-50 translate-middle ">
							<div className="effect-1f effectsf"></div>
							<div className="effect-2f effectsf"></div>
							<div className="effect-3f effectsf"></div>
						</div>
					</div>
				</div>
				)
		} else if(bg === 3) {
			return(
				<div className="d-flex justify-content-center align-items-center background-glassf w-75 top-50 start-50 translate-middle rounded-5 shadow">
					<div className="fallback-spinnerf app-loaderf background-lightf  position-absolute top-50 start-50 translate-middle ">
						<img className="fallback-logof  position-absolute top-50 start-50 translate-middle " src={window.localStorage.skin === '"dark"' ? whitelogo : logo} alt="logo"/>
						<div className="loadingf  position-absolute top-50 start-50 translate-middle ">
							<div className="effect-1f effectsf"></div>
							<div className="effect-2f effectsf"></div>
							<div className="effect-3f effectsf"></div>
						</div>
					</div>
				</div>
				)
		}
};

export default Spinn;

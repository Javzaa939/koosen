// ** Logo
import whitelogo from "@assets/images/logo/logo-white-compressed.png";
import logo from "@assets/images/logo/logo-muis.png";
import './smstyle.scss'

const SmSpinn = () => {
	return (
			<div className="d-flex justify-content-center align-items-center background-glasssm">
				<div className="fallback-spinnersm app-loadersm background-lightsm" >
					<div className="loadingsm">
						<div className="effect-1sm effectssm"></div>
						<div className="effect-2sm effectssm"></div>
						<div className="effect-3sm effectssm"></div>
					</div>
				</div>
			</div>
			)
};

export default SmSpinn;

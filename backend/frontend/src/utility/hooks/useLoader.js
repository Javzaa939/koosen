import React, { useState } from "react";

import FullSpinner from "@lms_components/Loader/FullSpinner";
import ButtonSpinner from "@lms_components/Loader/ButtonSpinner";
import MediumSpinner from "@lms_components/Loader/MediumSpinner";

// Шинэ Spinner
import Spinn from "@components/spinner/Spinn";
import MdSpinn from "@components/spinner/MedSpinn";
import SmSpinn from "@components/spinner/SmSpinn";


/**
 * Loading ийг хүсэлт явуулж байх хооронд харуулах эсэхийг ашиглах
 * @param {boolean} isFullScreen    бүтэн дэлгэцээр харуулах эсэх
 * @param {boolean} isSmall         Товч болон text зэргийн өмнө унших жижиг loader авах эсэх
 * @param {boolean} initValue       Loader ийн анхны утга
 * @param {boolean} text            Loader ийн өмнө харагдах text
 * @param {boolean} hasBackground   background харуулах эсэх
 * @param {number} bgType   background төрөл
 */

export default function useLoader({
	isFullScreen = false,
	isSmall = false,
	initValue = false,
	timeout = false,
	source = null,
	text=false,
	hasBackground=true,
	bg=1,
}) {
	const [isLoading, setLoading] = useState(initValue);

	const fetchData = async (axios) => {
		setLoading(true);
		const rsp = await axios.catch((err) => {
			if (timeout) {
				setTimeout(() => {
					setLoading(false);
				}, 1000);
			} else {
				setLoading(false);
			}
			return Promise.reject(err);
		});
		if (timeout) {
			setTimeout(() => {
				setLoading(false);
			}, 1000);
		} else {
			setLoading(false);
		}
		return rsp;
	};

	const cancel = () => {
		source && source.cancel("cancel");
	};

	return {
		Loader: isFullScreen
				?
				<Spinn bg={bg}/>
				:
				 isSmall
					? <SmSpinn />
					: <MdSpinn/>,
				fetchData, isLoading, cancel
		};
}

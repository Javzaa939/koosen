import { useEffect } from "react";

export const useVisibleFields = (name, visibleFieldsRef) => {
	useEffect(() => {
		visibleFieldsRef.current.add(name);

		return () => {
			visibleFieldsRef.current.delete(name);
		};
	}, [name, visibleFieldsRef]);
};

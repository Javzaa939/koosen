import useLoader from "@src/utility/hooks/useLoader";
import { useEffect, useRef, useState } from "react"

export default function useApiCustom({ apiFunction, deps = [], loaderArgs = {} }) {
	const { isLoading, fetchData, Loader } = useLoader(loaderArgs)
	const [data, setData] = useState()

	const getDataRef = useRef(async () => {
		const { success, data } = await fetchData(apiFunction())
		if (success) setData(data)
	})

	useEffect(() => {
		getDataRef.current()
	}, deps)

	return { data, isLoading, Loader }
}
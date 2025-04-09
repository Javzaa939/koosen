import useLoader from "@src/utility/hooks/useLoader";
import { useCallback, useEffect, useState } from "react"

export default function useApiCustom({ apiFunction, deps = [], loaderArgs = {} }) {
	const { isLoading, fetchData, Loader } = useLoader(loaderArgs)
	const [data, setData] = useState()

	const getDataRef = useCallback(async () => {
		const { success, data } = await fetchData(apiFunction())
		if (success) setData(data)
	}, deps)

	useEffect(() => {
		getDataRef()
	}, deps)

	return { data, isLoading, Loader }
}
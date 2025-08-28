import { useEffect, useState } from 'react';
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

export default function useScore({
	loaderArgs = {}
} = {}) {
	// Loader
	const { fetchData, Loader, isLoading } = useLoader(loaderArgs)

	// API
	const studentApi = useApi().student

	const [data, setData] = useState()

	function getScoreData() {
		Promise.all([
			fetchData(studentApi.scoreregister.get2()),
		]).then((values) => {
			setData(values[0]?.data)
		})
	}

	useEffect(() => {
		getScoreData()
	}, [])

	return {
		data: data,
		Loader: Loader,
		isLoading: isLoading,
	}
}
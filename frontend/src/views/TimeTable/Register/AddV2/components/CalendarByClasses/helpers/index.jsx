export function excludeEventsByBeginDate(groups, dateToDisplay) {
	if (!groups) return null
	const filteredGroups = {}

	Object.entries(groups).forEach(([groupName, events], index) => {
		const filteredGroupEvents = events.filter(event => !event.begin_date || event.begin_date === dateToDisplay)
		if (filteredGroupEvents.length) filteredGroups[groupName] = filteredGroupEvents
	})

	return Object.keys(filteredGroups).length ? filteredGroups : null
}

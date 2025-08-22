// ** React Imports
import { useState } from 'react'

export default function Question() {
	const [titleToNextStep, setTitleToNextStep] = useState('')

	return (
		<Fragment>
			{
				titleToNextStep
				?
				<EQuestions teacher_id={0} title_id={titleToNextStep} is_season={true} is_graduate={true}/>
				:
				<SeasonQuestions is_season={true} setTitleToNextStep={setTitleToNextStep}/>
			}
		</Fragment>
	)
}

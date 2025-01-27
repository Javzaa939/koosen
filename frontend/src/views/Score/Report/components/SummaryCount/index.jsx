import StatsHorizontal from "@src/@core/components/widgets/stats/StatsHorizontal";
import { UserCheck } from "react-feather";

export default function SummaryCount({count, title}) {

	return (
		<StatsHorizontal
			color="warning"
			statTitle={title}
			icon={<UserCheck size={20} />}
			renderStats={
				<h3 className="fw-bolder mb-75">
					{count}
				</h3>
			}
		/>
	)
}

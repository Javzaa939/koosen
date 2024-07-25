import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionActions from "@mui/material/AccordionActions";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Button from "@mui/material/Button";
import { Plus } from "react-feather";

export default function LessonCard({ count }) {
  return (
    <div>
      	<Accordion>
         	<AccordionSummary
				expandIcon={<ExpandMoreIcon />}
				aria-controls="panel3-content"
				id="panel3-header"
			>
				Accordion Actions
			</AccordionSummary>
			<AccordionDetails>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
				malesuada lacus ex, sit amet blandit leo lobortis eget.
			</AccordionDetails>
			<AccordionActions>
				<Button>Cancel</Button>
				<Button size="sm" color="primary">
					<Plus size={15} />
				</Button>
			</AccordionActions>
        </Accordion>
    </div>
  );
}
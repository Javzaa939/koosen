import { ListGroup, ListGroupItem } from "reactstrap";
import AddLessonForm from "../../Add/AddLessonForm";
import LessonMaterial from "../../LessonMaterial";
import LessonCard from "../LessonCard";

const RenderDetailPage = () => (
	<ListGroup>
		<ListGroupItem>
			<div
				className="d-flex flex-row justify-content-between"
				style={{
					cursor: "pointer",
				}}
			>
				<LessonMaterial />
			</div>
		</ListGroupItem>
    </ListGroup>
);

const RenderLessonCards = ({ lesson }) =>
	lesson?.create_type === 1 && (
		<ListGroup>
			{Array.from({ length: 16 }, (_, i) => (
				<LessonCard count={i} />
			))}
		</ListGroup>
  );

const RenderAddLessonForm = () => (
	<ListGroup>
			<ListGroupItem>
				<AddLessonForm />
			</ListGroupItem>
	</ListGroup>
);

const LessonTable = ({ lesson, selectedContent }) => {
	const id = selectedContent;

	if (!id) return null;

	switch (id) {
		case 4:
		return <RenderDetailPage />;
		case 1:
		return <RenderLessonCards lesson={lesson} />;
		case 2:
		return <RenderAddLessonForm />;
		default:
		return null;
	}
};

export default LessonTable;
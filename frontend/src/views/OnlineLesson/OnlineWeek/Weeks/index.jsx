import { useMemo, useState } from "react";
import { Button, Modal, ModalHeader } from "reactstrap";

import WeeksList from "./WeeksList";
import CreateWeekModal from "./CreateWeekModal";

function CreateWeek({ lesson}) {
	const toggle = () => setModal(!modal);

  	const [modal, setModal] = useState(false);
	const [isFresh, setIsFresh] = useState(false);

	const weeks = useMemo(
		() =>
		{
			return (
				<WeeksList lesson={lesson} isFresh={isFresh}/>
			)
		},
		[lesson]
	)

  	return (
		<div>
			<div className="d-flex justify-content-end">
				<Button color="primary m-1" onClick={toggle}>
					7 Хоног нэмэх
				</Button>
				<Modal
					className="modal-dialog-centered modal-lg"
					contentClassName="pt-0"
					backdrop="static"
					isOpen={modal}
					toggle={toggle}
				>
					<ModalHeader toggle={toggle}>7 Хоног нэмэх</ModalHeader>
					<CreateWeekModal toggle={toggle} lesson={lesson} isFresh={isFresh} setIsFresh={setIsFresh}/>
				</Modal>
			</div>
			{weeks}
  	  </div>
  	);
}

export default CreateWeek;

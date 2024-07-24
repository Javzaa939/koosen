import { Button, Modal, ModalHeader } from "reactstrap";
import { useState } from "react";
import AddLessonForm from "./AddLessonForm";
function AddLesson(args) {
  const [modal, setModal] = useState(false);

  const toggle = () => setModal(!modal);
  return (
    <div>
      <Button color="primary" onClick={toggle}>
        Хичээл үүсгэх
      </Button>
      <Modal
        className="modal-dialog-centered modal-lg"
        contentClassName="pt-0"
        backdrop="static"
        isOpen={modal}
        toggle={toggle}
        {...args}
      >
        <ModalHeader toggle={toggle}>Хичээл үүсгэх</ModalHeader>
        <AddLessonForm />
      </Modal>
    </div>
  );
}

export default AddLesson;
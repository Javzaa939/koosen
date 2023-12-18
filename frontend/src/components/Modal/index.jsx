
import { Modal, Button, ModalHeader, ModalFooter, ModalBody } from 'reactstrap';

import useModal from '@hooks/useModal';
import { t } from 'i18next';

export const initialModal = {
    header: {
        show: true,
        title: "",
        comp: null
    },
    body: null,
    footer: {
        show: true
    },
    btnClose: {
        icon: "",
        show: true,
        on: null,
        className: "",
        text: "Буцах",
        type: "reset",
        variant: "secondary"
    },
    btnAction: {
        show: false,
        icon: "",
        on: null,
        className: "",
        text: "Тийм",
        type: "submit",
        variant: 'warning'
    },
    backdrop: true,
    centered: true,
    size: "md",
    fullscreen: "md",
    dialogClassName: "",
    contentClassName: "bg-custom text-dark",
}

function CModal(props) {

    const { show, modal, onClose } = useModal()

    const hide = () => {
        onClose()
    }

    return (
        <Modal
            {...props}
            size={modal.size ? modal.size : 'md'}
            isOpen={show}
            // fullscreen={modal.fullscreen ? modal.fullscreen : 'sm'}
            onClosed={hide}
            keyboard={true}
            backdrop= {true}
            centered= {modal.centered ? modal.centered : true}
            scrollable={false}
        >
            {
                modal.header.show
                ?
                    <>
                        <ModalHeader className={`bg-transparent ms-1 pt-50 ${modal.header.title ? 'pb-0' : 'pb-1'}` }toggle={() => onClose()} />
                        {
                            modal.header.title
                            ? (
                                <h4 className={modal.header.className ? modal.header.className : 'text-center mb-1'}>
                                    {modal.header.title}
                                </h4>
                            )
                            : modal.header.comp
                                ? modal.header.comp
                                : null
                        }
                    </>
                :
                    null
            }
            <ModalBody className='pt-0 px-1 pb-1'>
                {modal?.body ? modal?.body : ''}
            </ModalBody>
            {
                modal.footer.show
                ?
                    <ModalFooter className='d-flex justify-content-center'>
                        {
                            modal.btnAction.show
                            &&
                            <Button
                                className={modal.btnAction.className}
                                color={modal.btnAction.color ? modal.btnAction.color : 'warning'}
                                type='submit'
                                size='sm'
                                onClick={ () => modal.btnAction.on() }
                                disabled={modal.btnAction.disabled}
                            >
                                <span className="align-middle">{t(modal.btnAction.text)}</span>
                            </Button>
                        }
                        {
                            modal.btnClose.show
                            &&
                            <Button
                                className={modal.btnClose.className}
                                color={modal.btnClose.color}
                                type='reset'
                                size='sm'
                                onClick={ () => modal.btnClose.on ? modal.btnClose.on() : hide()}
                                disabled={modal.btnClose.disabled}
                            >
                                <span className="align-middle">{t(modal.btnClose.text)}</span>
                            </Button>
                        }
                    </ModalFooter>
                : null
            }
        </Modal>
    );
}
export default CModal

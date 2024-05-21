import React, { useState } from 'react'
import {
    Accordion,
    AccordionBody,
    AccordionHeader,
    AccordionItem,
    Button,
    Col,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row
} from 'reactstrap'

import './style.scss'
import PrintMongolia from '../PrintMongolia';
import PrintEnglish from '../PrintEnglish';
import PrintNational from '../PrintNational';
import { useNavigate } from 'react-router-dom';

function PrintModal({ printModal, multiplePrintHandler, selectedRows }) {

    const navigate = useNavigate()

    const [open, setOpen] = useState('1');
    const toggle = (id) => {
        if (open === id) {
            setOpen();
        } else {
            setOpen(id);
        }
    };

    // function printHandler() {
    //     navigate('/student/graduation/printmain', { state:{} })
    // }

    return (
        <Modal
            isOpen={printModal}
            toggle={multiplePrintHandler}
            centered
            size='xl'
        >
            <ModalHeader toggle={multiplePrintHandler}>
                Олноор хэвлэх
            </ModalHeader>
            <ModalBody>
                <div style={{ height: '60vh', overflow: 'auto' }}>
                    <Accordion open={open} toggle={toggle}>
                        {selectedRows.map((data, idx) => {
                            return(
                                    <>
                                        <AccordionItem>
                                            <AccordionHeader targetId={idx}>{data?.student?.full_name}</AccordionHeader>
                                            <AccordionBody accordionId={idx}>
                                                <div className=''>
                                                    <div className='each_pages'>
                                                        <PrintMongolia nestingData={data}/>
                                                    </div>
                                                    <div className='each_pages'>
                                                        <PrintEnglish nestingData={data}/>
                                                    </div>
                                                    <div className='each_pages'>
                                                        <PrintNational nestingData={data}/>
                                                    </div>
                                                </div>
                                            </AccordionBody>
                                        </AccordionItem>
                                    </>
                                )
                        })}
                    </Accordion>
                </div>
            </ModalBody>
            <ModalFooter>
                <div className='d-flex gap-1'>
                    {/* <Button color='primary' onClick={() => {printHandler()}}>Хэвлэх</Button> */}
                    <Button onClick={() => {multiplePrintHandler()}}>Буцах</Button>
                </div>
            </ModalFooter>
        </Modal>
    )
}

export default PrintModal


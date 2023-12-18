
import React, { useEffect, useState } from "react"

import { Table, Popover, PopoverBody, Button } from "reactstrap"

/** Олон Popover ашиглахын тулд ашигласан
 * Төлбөр хийсэн түүх
 */
export default function BalancePopover({ balance, text, id })
{
    const [open, setOpen] = useState(false);
    const toggle = () => setOpen(!open);

    return (
        <div>

            <Button id={`popover-${id}`} type="button" onClick={toggle} >
                {text}
            </Button>

            <Popover target={`popover-${id}`} isOpen={open} placement="top" toggle={toggle} trigger="legacy" >
                <PopoverBody>
                    <Table size="sm" bordered striped responsive>
                        <thead className="leftHeader">
                            <tr>
                                <th className="leftHeader ps-50" colSpan={3}><i className="fas fa-list me-50"></i>{'Гүйлгээний түүх'}</th>
                            </tr>
                        </thead>
                        <thead>
                            <tr>
                                <th className="ps-50">Мөнгөн дүн</th>
                                <th>Огноо</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                balance
                                &&
                                balance && balance.length > 0 &&
                                balance.map((balanceData, idx) => {
                                    return (
                                        <tr key={idx}>
                                            <td>{balanceData?.balance_amount}</td>
                                            <td>{balanceData?.balance_date}</td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </Table>
                </PopoverBody>
            </Popover>

        </div>
    )
}

import React from 'react'

import { t } from "i18next";

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

export default function CTable({ datas }) {
    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table" size='small'>
                <TableHead>
                    <TableRow
                        sx={
                            {
                                "& th": {
                                    color: "white",
                                    fontSize: "14px",
                                    padding: "5px",
                                    backgroundColor: "#457b9d"
                                }
                            }
                        }
                    >
                        <TableCell>№</TableCell>
                        <TableCell>{t('Х/төрөл')}</TableCell>
                        <TableCell>{t('Багш')}</TableCell>
                        <TableCell>{t('Өдөр')}</TableCell>
                        <TableCell>{t('Цаг')}</TableCell>
                        <TableCell>{t('Өрөө')}</TableCell>
                        <TableCell>{t('Анги')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                    datas.map((row, idx) => {
                        return (
                            <TableRow key={idx}>
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell>{row?.type_time}</TableCell>
                                <TableCell>{row?.teacher?.full_name}</TableCell>
                                <TableCell>{row?.day_name}</TableCell>
                                <TableCell >{row?.is_block ? `${row?.begin_week} - ${row?.end_week}-р долоо хоног` : row?.time_name}</TableCell>
                                <TableCell >{row?.room ? row?.room?.full_name : row?.kurats_room}</TableCell>
                                <TableCell >{row?.group}</TableCell>
                            </TableRow>
                        )
                    })
                    }
                </TableBody>
            </Table>
        </TableContainer>
    )
}

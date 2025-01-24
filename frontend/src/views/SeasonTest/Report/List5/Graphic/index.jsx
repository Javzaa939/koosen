import { Box, Card, CardContent, CardHeader, Grid, Typography } from "@mui/material"
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import LimitChart from "./LimitChart";
import { useCallback } from "react";
import { TEACHER_IDX } from "@utility/consts";
import AnalysisTable from "./Table";

/**
    @param {} props
*/
const Graphic = (props) =>
{

    const data = props.data ?? {}
    const loading = props.loading

    if (loading)
    {
        return <Grid container spacing={3}>
            <Grid item md={12} xs={12}>
                <Card>
                    <CardContent>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    }

    if (!Object.keys(data)?.length)
    {
        return
    }

    if (data.hasOwnProperty("data") && !data.data?.length)
    {
        return <Card>
            <CardContent>
                <Box sx={{ display: "flex" }}>
                    <WarningRoundedIcon color={"warning"} sx={{ mx: 2 }} />
                    <Typography>Үр дүн байхгүй байна</Typography>
                </Box>
            </CardContent>
        </Card>
    }

    const fixData = useCallback(
        () =>
        {
            const newData = [...data.data]

            // багшийн дүн хайж олж нийлбэрийг нь олох
            const total = newData[TEACHER_IDX].data.reduce((total, current) => total += current.count, 0)
            console.log(total)

            const test = newData.map(
                (item, pidx) =>
                {
                    return {
                        "name": item.name,
                        "data": item.data.map(
                            (inside, idx) =>
                            {
                                return {
                                    "count": inside.count,
                                    "name": inside.name,
                                    "percent": TEACHER_IDX === pidx ? (inside.count * 100 / total).toFixed(2) : inside.count,
                                    "realPercent": TEACHER_IDX === pidx ? (inside.count * 100 / total) : inside.count,
                                }
                            }
                        )
                    }
                }
            )
            return {
                "names": data.names,
                "data": test
            }
        },
        []
    )

    const fixedData = fixData(data)
    console.log(props.extra)
    return (
        <>
            <Card sx={{ mb: 3 }}>
                <CardHeader title={`${props.extra.lesson} - ${props.extra.year} /${props.extra.season}/`}
                    subheader={props.extra.teacher}
                />
                <CardContent>
                    <LimitChart data={fixedData} />
                </CardContent>
            </Card>
            <AnalysisTable data={fixedData} extra={props.extra} />
        </>
    )
}
export default Graphic

import { Box, Card, CardContent, CardHeader, Grid, Typography } from "@mui/material"
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import LimitChart from "./LimitChart";

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

    return (
        <>
            <Card sx={{ mb: 3 }}>
                <CardHeader title={`${props.extra.lesson} - ${props.extra.year} /${props.extra.season}/`}
                    subheader={props.extra.teacher}
                />
                <CardContent>
                    <LimitChart data={data} />
                </CardContent>
            </Card>
        </>
    )
}
export default Graphic

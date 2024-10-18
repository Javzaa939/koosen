import { Grid, Skeleton } from "@mui/material"

/**
    @param {} props
*/
const VerticalBarChartLoader = (props) =>
{

    return (
        <Grid container spacing={5}>
            <Grid item xs={12}>
                {/* For variant="text", adjust the height via font-size */}
                <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
            </Grid>
            <Grid item xs={12}>
                {/* For other variants, adjust the size with `width` and `height` */}
                <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                <Skeleton variant="rectangular" width={"100%"} height={"270px"} />
            </Grid>
        </Grid>
    )
}
export default VerticalBarChartLoader

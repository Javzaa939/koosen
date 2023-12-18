import React from 'react'

import { Grid, Skeleton, Card, CardContent } from "@mui/material"

/**
    @param {} props
*/
const Loader = (props) =>
{

    return (
        <Card>
            <CardContent>
                <Grid container spacing={3} sx={{m:5}}>
                    <Grid item xs={4}>
                        <Skeleton variant="circular" width={40} height={40} />
                    </Grid>
                    <Grid item xs={8}>
                        <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                        <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}
export default Loader

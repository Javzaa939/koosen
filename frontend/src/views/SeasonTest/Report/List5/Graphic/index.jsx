import { Box, Card, CardContent, CardHeader, Grid, Typography } from '@mui/material';
import LimitChart from './LimitChart';
import { useCallback } from 'react';
import { TEACHER_IDX } from '@utility/consts';
import AnalysisTable from './Table';
import { CircleAlertIcon } from 'lucide-react';

/**
    @param {} props
*/
const Graphic = (props) => {
    const data = props.data ?? {};
    const loading = props.loading;

    if (loading) {
        return (
            <Grid container spacing={3}>
                <Grid item md={12} xs={12}>
                    <Card>
                        <CardContent></CardContent>
                    </Card>
                </Grid>
            </Grid>
        );
    }

    if (!Object.keys(data)?.length) {
        return;
    }

    if (data.hasOwnProperty('data') && !data.data?.length) {
        return (
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex' }}>
                        <CircleAlertIcon color={'warning'} sx={{ mx: 2 }} />
                        <Typography>Үр дүн байхгүй байна</Typography>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    const fixData = useCallback(() => {
        const newData = [...data.data];

        // багшийн дүн хайж олж нийлбэрийг нь олох
        let total = {};
        const teach_scores = newData[TEACHER_IDX].data;

        teach_scores.forEach((item) => {
            if (!total.hasOwnProperty(item.assessment)) {
                total[item.assessment] = teach_scores.reduce((sum, current) => {
                    if (current.assessment === item.assessment) sum++;

                    return sum;
                }, 0);
            }
        });

        const test = newData.map((item, pidx) => {
            return {
                name: item.name,
                data: item.data.map((inside, idx) => {
                    const percent = (total[inside.assessment] * 100) / teach_scores.length;

                    const res = {
                        count: TEACHER_IDX === pidx ? total[inside.assessment] : inside.count,
                        name: TEACHER_IDX === pidx ? inside.assessment : inside.name,
                        percent: TEACHER_IDX === pidx ? percent.toFixed(2) : inside.count,
                        realPercent: TEACHER_IDX === pidx ? percent : inside.count,
                    };
                    // console.log('wwwww',res)
                    return res;
                }),
            };
        });
        return {
            names: data.names,
            data: test,
        };
    }, []);

    const fixedData = fixData(data);
    // console.log(props.extra)
    return (
        <>
            <Card sx={{ mb: 3 }}>
                <CardHeader
                    title={`${props.extra.lesson} - ${props.extra.year} /${props.extra.season}/`}
                    subheader={props.extra.teacher}
                />
                <CardContent>
                    <LimitChart data={fixedData} />
                </CardContent>
            </Card>
            <AnalysisTable data={fixedData} extra={props.extra} />
        </>
    );
};
export default Graphic;

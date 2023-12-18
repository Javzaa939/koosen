import Carousel from 'react-material-ui-carousel'

import { Card } from "reactstrap"

const CCarousel = (props) =>
{
    function errorImage(e) {
        e.target.src = require('@src/assets/images/empty-image.jpg').default
    }

    return (
        <Carousel className='border'>
            {
                props.items.length && props.items.map((item, i) => {
                    // if (item.body)
                    // {
                    //     return item.body
                    // }
                    return (
                        <Card
                            key={i}
                            sx={{ bgcolor: 'primary.main' }}
                            style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                        >
                            <img
                                src={item?.file}
                                style={{
                                    width: "auto",
                                    height: "30vh"
                                }}
                                onError={errorImage}
                            />
                            <Card sx={{ position: "absolute", bottom: 0, paddingBottom: 1, right: 0, left: 0, textAlign: "center", background: "rgba(0,0,0,0.5)", color: "white" }}>
                                {item?.description}
                            </Card>
                        </Card>
                    )
                })
            }
        </Carousel>
    )
}
export default CCarousel

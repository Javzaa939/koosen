import useApi from '@src/utility/hooks/useApi';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import LessonTable from './LessontTable';
import useLoader from '@hooks/useLoader';
import { ArrowLeftIcon } from 'lucide-react';

const menuOptions = [
    {
        name: 'Хичээлийн 7 хоног',
        option: 3,
    },
    {
        name: 'Зарлал',
        option: 1,
    },
    {
        name: 'Шалгалт',
        option: 4,
    },
    {
        name: 'Судалж буй оюутнууд',
        option: 5,
    },
    {
        name: 'Хичээлийн танилцуулга',
        option: 2,
    },
];

function OnlineLessonPage() {
    // States
    const [selectedContent, setSelectedContent] = useState(3);
    const [lesson, setLesson] = useState(null);

    const { fetchData } = useLoader({});

    // API
    const onlineLessonApi = useApi().online_lesson;

    // Hooks
    const { index: lessonId } = useParams();

    // Хичээлийн мэдээлэл
    const getLesson = async () => {
        const { success, data } = await fetchData(onlineLessonApi.getOne(lessonId));
        if (success) {
            setLesson(data);
        }
    };

    useEffect(() => {
        getLesson();
    }, [lessonId]);

    const customStyles = {
        backgroundColor: '#265C9F',
        color: 'white',
    };

    const lesson_week = useMemo(() => {
        return (
            <LessonTable lesson={lesson} selectedContent={selectedContent} getLesson={getLesson} />
        );
    }, [selectedContent, lesson]);

    return (
        <div className="d-flex flex-row w-100">
            <Card className="w-100">
                <CardHeader className="w-100">
                    <Row className="w-100">
                        <Col md={3} sm={2} xs={0} className="cursor-pointer">
                            <Link to="/online_lesson">
                                <Button outline size="md">
                                    <ArrowLeftIcon size={16} />
                                </Button>
                            </Link>
                        </Col>
                        <Col md={9} sm={10} xs={12} className="cursor-pointer">
                            <div>
                                <h4 className="m-0">{lesson?.lesson_name}</h4>
                            </div>
                        </Col>
                    </Row>
                </CardHeader>
                <CardBody className="m-0 p-0">
                    <Row className="m-0 p-0">
                        {menuOptions.map((item, index) => (
                            <Col
                                xl={2}
                                lg={3}
                                md={4}
                                sm={5}
                                xs={12}
                                className="cursor-pointer"
                                key={index}
                            >
                                <div className="border rounded-lg shadow-sm">
                                    <div
                                        className="p-1"
                                        style={item.option === selectedContent ? customStyles : {}}
                                        onClick={() => setSelectedContent(item.option)}
                                    >
                                        <div className="d-flex justify-content-between">
                                            {item.name}
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                    {lesson_week}
                </CardBody>
            </Card>
        </div>
    );
}

export default OnlineLessonPage;


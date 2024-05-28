import React from 'react'
import { useLocation } from 'react-router-dom';

function OnlineLessonPage() {
      const location = useLocation();
      const lesson = location.state.lesson;
  return (
    <div>OnlineLessonPage{lesson?.name}</div>
  )
}

export default OnlineLessonPage
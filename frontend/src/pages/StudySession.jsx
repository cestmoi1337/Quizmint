import { useParams } from 'react-router-dom';

function StudySession() {
  const { sessionId } = useParams(); // Extract the dynamic sessionId from URL
  return (
    <h1 className="text-2xl text-orange-600">Study Session ID: {sessionId}</h1>
  );
}

export default StudySession;

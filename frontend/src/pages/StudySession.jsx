import { useParams } from "react-router-dom";          // To read the :sessionId from the URL
import { useEffect, useState } from "react";           // For managing state and fetching data
import { doc, getDoc } from "firebase/firestore";      // Firestore functions to get a document
import { db } from "../firebase";                      // Our initialized Firestore database

function StudySession() {
  // Get the dynamic sessionId from the URL (e.g. /session/abc123)
  const { sessionId } = useParams();

  // Local state to store the fetched session data
  const [session, setSession] = useState(null);

  // Fetch the session from Firestore on component mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        // Reference to the document in "sessions" collection
        const docRef = doc(db, "sessions", sessionId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // Save the data to state
          setSession(docSnap.data());
        } else {
          console.log("No such session exists in Firestore.");
        }
      } catch (err) {
        console.error("Error retrieving session:", err);
      }
    };

    fetchSession(); // Run the fetch on page load
  }, [sessionId]);

  // Show a loading message while data is being fetched
  if (!session) return <div className="p-6">Loading session...</div>;

  // Once loaded, display the session info
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-2">Study Session</h1>
      <p><strong>Age:</strong> {session.age}</p>
      <p><strong>Difficulty:</strong> {session.difficulty}</p>
      <p><strong>Created:</strong> {session.createdAt?.toDate().toLocaleString()}</p>
    </div>
  );
}

export default StudySession;

import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

function Home() {
  // Function to add a test document to Firestore
  const createTestDoc = async () => {
    try {
      const docRef = await addDoc(collection(db, "testCollection"), {
        message: "Hello from Quizmint!",
        timestamp: new Date(),
      });
      alert(`Document written with ID: ${docRef.id}`);
    } catch (e) {
      console.error("Error adding document: ", e);
      alert("Error writing to Firestore. Check the console.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl text-blue-600 mb-4">Welcome to Quizmint 🧠</h1>
      <button
        onClick={createTestDoc}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Create Test Firestore Document
      </button>
    </div>
  );
}

export default Home;

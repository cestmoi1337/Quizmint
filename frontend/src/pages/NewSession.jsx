import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

function NewSession() {
  const [age, setAge] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const docRef = await addDoc(collection(db, "sessions"), {
      age: parseInt(age),
      difficulty,
      createdAt: serverTimestamp(),
    });
    navigate(`/session/${docRef.id}`);
  } catch (error) {
    console.error("Failed to create session:", error);
    alert("Something went wrong. Please try again.");
  }
};

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Create a Study Session</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Age:</label>
          <input
            type="number"
            className="border w-full p-2 rounded"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Difficulty:</label>
          <select
            className="border w-full p-2 rounded"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Start Session
        </button>
      </form>
    </div>
  );
}

export default NewSession;

import { useParams } from "react-router-dom"; // Read :sessionId from URL
import { useEffect, useState } from "react"; // React state/hooks
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore"; // Firestore
import * as pdfjsLib from "pdfjs-dist/build/pdf"; // PDF parsing
import PDFUploader from "../components/PDFUploader"; // Upload UI
import { db } from "../firebase"; // Firebase config

// ✅ Set worker path for pdf.js (for Vite/Vercel)
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

function StudySession() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null); // Firestore session
  const [previewText, setPreviewText] = useState(""); // PDF preview
  const [flashcards, setFlashcards] = useState([]); // Flashcard list

  // ✅ Fetch session and flashcards on mount
  useEffect(() => {
    fetchSession();
    fetchFlashcards();
  }, [sessionId]);

  // 🔍 Fetch session data
  const fetchSession = async () => {
    try {
      const docRef = doc(db, "sessions", sessionId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSession(docSnap.data());
      } else {
        console.warn("⚠️ Session not found in Firestore.");
      }
    } catch (err) {
      console.error("❌ Error fetching session:", err);
    }
  };

  // 📚 Fetch flashcards from subcollection
  const fetchFlashcards = async () => {
    try {
      const flashcardsRef = collection(db, "sessions", sessionId, "flashcards");
      const snapshot = await getDocs(flashcardsRef);
      const cards = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setFlashcards(cards);
    } catch (err) {
      console.error("❌ Error loading flashcards:", err);
    }
  };

  // 📄 Extract PDF text and update Firestore
  const extractTextFromPDF = async (file) => {
    const reader = new FileReader();

    reader.onload = async () => {
      const typedArray = new Uint8Array(reader.result);

      try {
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map((item) => item.str).join(" ");
          fullText += pageText + "\n";
        }

        // ✅ Save extracted text
        const docRef = doc(db, "sessions", sessionId);
        await updateDoc(docRef, {
          extractedText: fullText,
          extractedAt: serverTimestamp(),
        });

        // ✅ Generate flashcards
        await generateFlashcards(fullText);

        // ✅ Show preview
        setPreviewText(fullText);
        console.log("✅ Extracted and saved PDF text to Firestore.");
      } catch (err) {
        console.error("❌ Failed to extract or save PDF text:", err);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // 🧠 Mock flashcard generation
  const generateFlashcards = async (text) => {
    const sessionRef = doc(db, "sessions", sessionId);

    const examples = [
      {
        question: "What is the topic of this document?",
        answer: text.split(".")[0] || "No answer available",
      },
      {
        question: "Summarize one key point.",
        answer: text.split(".")[1] || "No answer available",
      },
      {
        question: "What is another concept mentioned?",
        answer: text.split(".")[2] || "No answer available",
      },
    ];

    const flashcardsCol = collection(sessionRef, "flashcards");
    await Promise.all(examples.map((card) => addDoc(flashcardsCol, card)));

    console.log("✅ Mock flashcards saved to Firestore.");

    // 🔁 Refresh list after saving
    fetchFlashcards();
  };

  if (!session) return <div className="p-6">Loading session...</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-2">Study Session</h1>
      <p>
        <strong>Age:</strong> {session.age}
      </p>
      <p>
        <strong>Difficulty:</strong> {session.difficulty}
      </p>
      <p>
        <strong>Created:</strong>{" "}
        {session.createdAt?.toDate().toLocaleString()}
      </p>

      <hr className="my-6" />
      <h2 className="text-lg font-semibold mb-2">Generate Study Materials</h2>
      <PDFUploader onPDFSelected={extractTextFromPDF} />

      {/* 📄 PDF Text Preview */}
      {previewText && (
        <div className="mt-6 p-4 bg-gray-50 border rounded">
          <h3 className="font-semibold mb-2">📄 Extracted Preview:</h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-800">
            {previewText}
          </pre>
        </div>
      )}

      {/* 🧠 Render flashcards */}
      {flashcards.length > 0 && (
        <>
          <hr className="my-6" />
          <h3 className="text-md font-semibold mb-2">🧠 Flashcards</h3>
          <ul className="space-y-4">
            {flashcards.map((card, index) => (
              <li key={index} className="p-4 bg-white rounded shadow">
                <p>
                  <strong>Q:</strong> {card.question}
                </p>
                <p>
                  <strong>A:</strong> {card.answer}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* 📄 Full Extracted Content */}
      {session.extractedText && (
        <>
          <hr className="my-6" />
          <h3 className="text-md font-semibold mb-2">Extracted PDF Content:</h3>
          <pre className="bg-gray-100 p-3 rounded whitespace-pre-wrap text-sm max-h-96 overflow-y-auto">
            {session.extractedText}
          </pre>
        </>
      )}
    </div>
  );
}

export default StudySession;

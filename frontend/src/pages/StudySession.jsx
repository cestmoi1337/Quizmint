import { useParams } from "react-router-dom";              // To read the :sessionId from the URL
import { useEffect, useState } from "react";               // For managing state and fetching data
import { doc, getDoc, updateDoc } from "firebase/firestore"; // Firestore functions to get and update a document
import { db } from "../firebase";                          // Firebase config
import PDFUploader from "../components/PDFUploader";       // PDF upload UI
import * as pdfjsLib from "pdfjs-dist/build/pdf";          // PDF.js legacy-compatible build

// ✅ Tell pdf.js where the worker is (Vite-compatible path)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

function StudySession() {
  const { sessionId } = useParams();               // Read sessionId from URL
  const [session, setSession] = useState(null);    // Store session data
  const [pdfText, setPdfText] = useState("");      // Store extracted PDF text

  // Load session details on page load
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const docRef = doc(db, "sessions", sessionId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setSession(docSnap.data()); // Store session data
          setPdfText(docSnap.data()?.pdfText || ""); // Load previously saved PDF text if any
        } else {
          console.log("No such session exists in Firestore.");
        }
      } catch (err) {
        console.error("Error retrieving session:", err);
      }
    };

    fetchSession();
  }, [sessionId]);

  // 🔍 Extracts full text from the uploaded PDF file and saves it
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

        console.log("📄 Extracted Text:", fullText);

        // 💾 Save to Firestore under this session
        const docRef = doc(db, "sessions", sessionId);
        await updateDoc(docRef, { pdfText: fullText });

        // Update local state to reflect saved text
        setPdfText(fullText);
      } catch (err) {
        console.error("❌ Failed to extract or save PDF text:", err);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  if (!session) return <div className="p-6">Loading session...</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-2">Study Session</h1>
      <p><strong>Age:</strong> {session.age}</p>
      <p><strong>Difficulty:</strong> {session.difficulty}</p>
      <p><strong>Created:</strong> {session.createdAt?.toDate().toLocaleString()}</p>

      <hr className="my-6" />
      <h2 className="text-lg font-semibold mb-2">Generate Study Materials</h2>

      {/* Upload + extract text from PDF */}
      <PDFUploader onPDFSelected={extractTextFromPDF} />

      {pdfText && (
        <>
          <hr className="my-6" />
          <h3 className="text-md font-semibold mb-2">Extracted Text:</h3>
          <pre className="bg-gray-100 p-4 rounded max-h-[300px] overflow-y-auto whitespace-pre-wrap">
            {pdfText}
          </pre>
        </>
      )}
    </div>
  );
}

export default StudySession;

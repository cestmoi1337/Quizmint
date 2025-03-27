import { useParams } from "react-router-dom";              // To read the :sessionId from the URL
import { useEffect, useState } from "react";               // For managing state and fetching data
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";                          // Firebase config
import PDFUploader from "../components/PDFUploader";       // PDF upload UI
import * as pdfjsLib from "pdfjs-dist/build/pdf";   

      // ✅ Use the legacy-compatible build

// ✅ Tell pdf.js to load the worker from the public folder (works with Vite)
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

function StudySession() {
  const { sessionId } = useParams();               // Read sessionId from URL
  const [session, setSession] = useState(null);    // Store session data

  // Load session details on page load
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const docRef = doc(db, "sessions", sessionId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setSession(docSnap.data()); // Store session data
        } else {
          console.log("No such session exists in Firestore.");
        }
      } catch (err) {
        console.error("Error retrieving session:", err);
      }
    };

    fetchSession();
  }, [sessionId]);

  // Show loading message if data not yet loaded
  if (!session) return <div className="p-6">Loading session...</div>;

  // 🔍 Extract text from PDF and save to Firestore
const extractTextFromPDF = async (file) => {
  const reader = new FileReader();

  reader.onload = async () => {
    const typedArray = new Uint8Array(reader.result);

    try {
      const pdf = await pdfjsLib.getDocument(typedArray).promise;
      let fullText = "";

      // Loop through all pages to extract text
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => item.str).join(" ");
        fullText += pageText + "\n";
      }

      console.log("📄 Extracted Text:", fullText); // Preview in dev console

      // ✅ Save extracted text into Firestore under this session
      const sessionRef = doc(db, "sessions", sessionId);
      await updateDoc(sessionRef, {
        rawText: fullText,
      });

      console.log("✅ Saved extracted text to Firestore!");
    } catch (err) {
      console.error("❌ Failed to extract PDF text:", err);
    }
  };

  reader.readAsArrayBuffer(file);
};

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
    </div>
  );
}

export default StudySession;

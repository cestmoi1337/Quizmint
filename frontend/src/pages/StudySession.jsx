import { useParams } from "react-router-dom";              // Route param (sessionId)
import { useEffect, useState } from "react";               // React state & lifecycle
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"; // Firestore utils
import * as pdfjsLib from "pdfjs-dist/build/pdf";          // PDF parser
import PDFUploader from "../components/PDFUploader";       // Upload component
import { db } from "../firebase";                          // Firebase config

// Set PDF.js worker path to public folder (Vercel-compatible)
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

function StudySession() {
  const { sessionId } = useParams();               // Extract sessionId from URL
  const [session, setSession] = useState(null);    // Holds Firestore session data
  const [previewText, setPreviewText] = useState(""); // Shows immediate preview of extracted text

  // 🔍 Fetch session details from Firestore
  useEffect(() => {
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

    fetchSession();
  }, [sessionId]);

  // 📄 Extracts full text from PDF, saves to Firestore, updates preview
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

        const docRef = doc(db, "sessions", sessionId);
        await updateDoc(docRef, {
          extractedText: fullText,
          extractedAt: serverTimestamp(),
        });

        setPreviewText(fullText);
        console.log("✅ Extracted and saved PDF text to Firestore.");
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

      <PDFUploader onPDFSelected={extractTextFromPDF} />

      {previewText && (
        <div className="mt-6 p-4 bg-gray-50 border rounded">
          <h3 className="font-semibold mb-2">📄 Extracted Preview:</h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-800">{previewText}</pre>
        </div>
      )}

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

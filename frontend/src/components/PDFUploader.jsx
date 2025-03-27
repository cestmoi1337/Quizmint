import { useState } from "react";

// A reusable component to upload a PDF file and pass it up to the parent
function PDFUploader({ onPDFSelected }) {
  const [fileName, setFileName] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setFileName(file.name);
      onPDFSelected(file); // Send the file to the parent component
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  return (
    <div className="mb-4">
      <label className="block mb-1 font-medium">Upload PDF Document:</label>
      <input type="file" accept=".pdf" onChange={handleFileChange} />
      {fileName && <p className="mt-2 text-sm text-gray-600">Selected: {fileName}</p>}
    </div>
  );
}

export default PDFUploader;

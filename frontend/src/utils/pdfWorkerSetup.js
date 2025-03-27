import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf"; // Use legacy build for Vite compatibility

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.min.js",
  import.meta.url
).toString();

export { pdfjsLib };

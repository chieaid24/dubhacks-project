"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

/////////////////////////// HAVE BACKEND CREATE IMAGES FROM PDF AND THEN RENDER THEM HERE /////////


// ✅ Worker setup for Next.js
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface PDFViewerProps {
  /** Can be a URL string or a File/Blob object */
  file: string | File | Blob;
  pageNumber: number;
  setPageNumber: (num: number) => void;
}

export default function PDFViewer({
  file,
  pageNumber,
  setPageNumber,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(pageNumber);
  };

  const handlePrev = () => setPageNumber(Math.max(pageNumber - 1, 1));
  const handleNext = () =>
    setPageNumber(Math.min(pageNumber + 1, numPages || pageNumber));

  return (
    <div className="flex flex-col items-center p-4 text-white">
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        className="flex flex-col items-center"
      >
        <Page pageNumber={pageNumber} />
      </Document>

      {numPages && (
        <div className="mt-4 flex items-center gap-4">
          <button
            onClick={handlePrev}
            disabled={pageNumber <= 1}
            className="px-3 py-1 bg-gray-700 rounded disabled:opacity-40"
          >
            ← Prev
          </button>

          <span className="text-sm">
            Page {pageNumber} of {numPages}
          </span>

          <button
            onClick={handleNext}
            disabled={pageNumber >= numPages}
            className="px-3 py-1 bg-gray-700 rounded disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

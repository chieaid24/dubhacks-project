"use client";

import { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { LectureData } from "@/types/lecture";
import UploadModal from "./UploadModal";
import type { StoredLectureFile } from "@/lib/localFileStorage";

const PDFDocument = dynamic(
  () => import("react-pdf").then((mod) => mod.Document),
  { ssr: false }
) as typeof import("react-pdf").Document;

const PDFPage = dynamic(
  () => import("react-pdf").then((mod) => mod.Page),
  { ssr: false }
) as typeof import("react-pdf").Page;

interface PowerPointSectionProps {
  lectureData: LectureData | null;
  isUploading: boolean;
  showUploadModal: boolean;
  onFileUpload: (file: File) => void;
  storedLectureFile: StoredLectureFile | null;
}

export default function PowerPointSection({
  lectureData,
  isUploading,
  showUploadModal,
  onFileUpload,
  storedLectureFile,
}: PowerPointSectionProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);

  useEffect(() => {
    void import("@/lib/pdfWorker");
  }, []);

  const isPdfFile = useMemo(() => {
    if (!storedLectureFile) return false;
    const byType =
      storedLectureFile.type === "application/pdf" ||
      storedLectureFile.type === "application/x-pdf";
    const byName = storedLectureFile.name.toLowerCase().endsWith(".pdf");
    return byType || byName;
  }, [storedLectureFile]);

  const pdfData = useMemo(() => {
    if (!storedLectureFile || !isPdfFile) return null;

    try {
      const [, base64Data] = storedLectureFile.dataUrl.split(",");
      const binaryString = atob(base64Data);
      const length = binaryString.length;
      const bytes = new Uint8Array(length);

      for (let i = 0; i < length; i += 1) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      return bytes;
    } catch (error) {
      console.error("Failed to decode stored PDF data.", error);
      return null;
    }
  }, [storedLectureFile, isPdfFile]);

  useEffect(() => {
    setPageNumber(1);
    setNumPages(0);
  }, [pdfData]);

  const handleDocumentLoadSuccess = ({ numPages: total }: { numPages: number }) => {
    setNumPages(total);
  };

  const handlePreviousPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPageNumber((prev) => (numPages ? Math.min(prev + 1, numPages) : prev));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const allowedTypes = ['.pptx', '.pdf'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (allowedTypes.includes(fileExtension)) {
        onFileUpload(file);
      } else {
        alert('Please upload a .pptx or .pdf file');
      }
    }
  };
  const renderPdfViewer = () => {
    if (!pdfData) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-text-light-gray">
          <p className="text-lg font-medium text-text-white mb-2">Unable to load PDF</p>
          <p className="text-sm text-text-medium-gray">Try uploading your slides again.</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto bg-bg-dark flex items-center justify-center px-4 py-6">
          <div className="bg-bg-dark-secondary border border-border-dark-light rounded-xl shadow-lg p-4 max-w-full flex justify-center">
            <PDFDocument
              key={storedLectureFile?.name ?? "pdf-viewer"}
              file={{ data: pdfData }}
              onLoadSuccess={handleDocumentLoadSuccess}
              loading={
                <div className="flex flex-col items-center justify-center px-8 py-12 text-text-light-gray">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                  <p className="text-sm text-text-medium-gray">Loading PDF...</p>
                </div>
              }
              error={
                <div className="flex flex-col items-center justify-center px-8 py-12 text-text-light-gray">
                  <p className="text-lg font-medium text-text-white mb-2">Failed to render PDF</p>
                  <p className="text-sm text-text-medium-gray">Please try uploading the file again.</p>
                </div>
              }
            >
              <PDFPage
                pageNumber={pageNumber}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                className="rounded-lg overflow-hidden shadow-xl"
              />
            </PDFDocument>
          </div>
        </div>

        <div className="border-t border-border-dark-light bg-bg-dark-secondary py-3 px-4 flex items-center justify-between">
          <div className="text-sm text-text-medium-gray">
            Page <span className="text-text-white font-semibold">{pageNumber}</span>
            {numPages ? (
              <span className="text-text-medium-gray"> of {numPages}</span>
            ) : (
              <span className="text-text-medium-gray"> of ...</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={pageNumber <= 1}
              className="px-3 py-2 rounded-lg border border-border-dark-light text-sm text-text-white hover:bg-hover-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={!numPages || pageNumber >= numPages}
              className="px-3 py-2 rounded-lg border border-border-dark-light text-sm text-text-white hover:bg-hover-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 bg-bg-dark border-r border-b border-border-dark-light relative flex flex-col">
      {pdfData && isPdfFile ? (
        renderPdfViewer()
      ) : lectureData ? (
        <div className="p-6 h-full overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4 text-text-white">{lectureData.title}</h2>
          <div className="space-y-4">
            {lectureData.slides.map((slide, index) => (
              <div key={index} className="border border-border-dark-light rounded-lg p-4 bg-bg-dark-secondary">
                <h3 className="font-medium text-lg mb-2 text-text-white">{slide.title}</h3>
                <p className="text-text-light-gray mb-3">{slide.content}</p>
                {slide.audioUrl && (
                  <audio controls className="w-full">
                    <source src={slide.audioUrl} type="audio/mpeg" />
                  </audio>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div 
          className="h-full flex items-center justify-center bg-bg-dark"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className={`text-center text-text-light-gray p-8 rounded-lg border-2 border-dashed transition-colors ${
            isDragOver ? 'border-primary bg-hover-dark' : 'border-transparent'
          }`}>
            <div className="w-16 h-16 mx-auto mb-4 bg-bg-dark-secondary rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-lg font-medium text-text-white">Upload your slides</p>
            <p className="text-sm text-text-medium-gray">{isDragOver ? 'Drop your file here' : 'Drag and drop or click to select'}</p>
          </div>
        </div>
      )}

      {/* Upload Modal Overlay */}
      {showUploadModal && (
        <UploadModal isUploading={isUploading} onFileUpload={onFileUpload} />
      )}
    </div>
  );
}

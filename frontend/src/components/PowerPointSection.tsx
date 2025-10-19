"use client";

import { useMemo, useState, useEffect } from "react";
import { LectureData } from "@/types/lecture";
import UploadModal from "./UploadModal";
import AudioPlayer from "./AudioPlayer";
import dynamic from "next/dynamic"
import type { StoredLectureFile } from "@/lib/localFileStorage";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface PowerPointSectionProps {
  lectureData: LectureData | null;
  isUploading: boolean;
  showUploadModal: boolean;
  onFileUpload: (file: File) => void;
  storedLectureFile: StoredLectureFile | null;
}

export default function PowerPointSection({
  isUploading,
  showUploadModal,
  onFileUpload,
  storedLectureFile,
}: PowerPointSectionProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [lectureFile, setLectureFile] = useState<StoredLectureFile | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  const PDFViewer = dynamic(() => import('../components/PDFViewer'), { ssr: false })

  // 🔁 Sync local lectureFile with storedLectureFile whenever it changes
  useEffect(() => {
    if (storedLectureFile) {
      setLectureFile(storedLectureFile);
    } else {
      setLectureFile(null);
    }
    console.log("storedLectureFile changed:", storedLectureFile);
  }, [storedLectureFile]);

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
      const allowedTypes = [".pptx", ".pdf"];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."));

      if (allowedTypes.includes(fileExtension)) {
        onFileUpload(file);
      } else {
        alert("Please upload a .pptx or .pdf file");
      }
    }
  };

    // ✅ Helper to get full backend URL
  const getAudioUrl = (relativeUrl: string) =>
    `http://localhost:8000${relativeUrl}`;

  return (
    <div className="flex-1 bg-bg-dark border-r border-b border-border-dark-light relative flex flex-col">
      {lectureFile ? (
        <div className="p-6 h-full overflow-y-auto">
          <PDFViewer file={lectureFile.dataUrl} pageNumber={pageNumber} setPageNumber={setPageNumber} />
          <div className="space-y-4">
            {pageNumber}
            <AudioPlayer src={getAudioUrl(lectureFile.dataUrl)} /> 
          </div>
        </div>
      ) : (
        <div
          className="h-full flex items-center justify-center bg-bg-dark"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div
            className={`text-center text-text-light-gray p-8 rounded-lg border-2 border-dashed transition-colors ${
              isDragOver ? "border-primary bg-hover-dark" : "border-transparent"
            }`}
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-bg-dark-secondary rounded-lg flex items-center justify-center">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-lg font-medium text-text-white">Upload your slides</p>
            <p className="text-sm text-text-medium-gray">
              {isDragOver ? "Drop your file here" : "Drag and drop or click to select"}
            </p>
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

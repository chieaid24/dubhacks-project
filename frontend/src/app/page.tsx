"use client";

import { useEffect, useState } from "react";
import { LectureData } from "@/types/lecture";
import PowerPointSection from "@/components/PowerPointSection";
import ChatbotSection from "@/components/ChatbotSection";
import AdditionalNotesSection from "@/components/AdditionalNotesSection";
import {
  clearStoredFile,
  getStoredFile,
  saveFileToLocalStorage,
} from "@/lib/localFileStorage";
import type { StoredLectureFile } from "@/lib/localFileStorage";

const buildMockLectureData = (fileName: string): LectureData => ({
  filename: fileName,
  slide_count: 1, // consider making this a number if it always is one
  lecture_pages: [{
    page_number: 1,
    lecture_text: "string",
  }],
  audio_urls: [],
  add_notes: [["title", "body"]], // tuple array
});

export default function Home() {
  const [lectureData, setLectureData] = useState<LectureData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(true);
  const [storedLectureFile, setStoredLectureFile] = useState<StoredLectureFile | null>(null);

  const resetLecture = () => {
    clearStoredFile();
    setLectureData(null);
    setShowUploadModal(true);
    setIsUploading(false);
    setStoredLectureFile(null);
  };

  useEffect(() => {
    const storedFile = getStoredFile();

    if (storedFile) {
      setLectureData(buildMockLectureData(storedFile.name));
      setShowUploadModal(false);
      setStoredLectureFile(storedFile);
    }
  }, []);


  const handleFileUpload = async (file: File) => {
    setIsUploading(true);

    try {
      console.log("Saving slides file locally:", file.name);

      const storedFile = await saveFileToLocalStorage(file);
      setStoredLectureFile(storedFile);

      // Mock processing for now - replace with actual backend call later
      setTimeout(() => {
        setLectureData(buildMockLectureData(storedFile.name));
        setShowUploadModal(false);
        setIsUploading(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to save file locally:", error);
      setIsUploading(false);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="h-screen flex bg-bg-darkest text-white">
      {/* Left Side - Additional Notes */}
      <AdditionalNotesSection lectureData={lectureData} onNewStory={resetLecture} />

      {/* Left Side - PowerPoint and Chatbot */}
      <div className="flex-1 flex flex-col">
        <PowerPointSection
          lectureData={lectureData}
          isUploading={isUploading}
          showUploadModal={showUploadModal}
          onFileUpload={handleFileUpload}
          storedLectureFile={storedLectureFile}
        />

        <ChatbotSection lectureData={lectureData} />
      </div>

    </div>
  );
}

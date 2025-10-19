
"use client";

import { useState } from "react";
import { LectureData } from "@/types/lecture";
import PowerPointSection from "@/components/PowerPointSection";
import ChatbotSection from "@/components/ChatbotSection";
import AdditionalNotesSection from "@/components/AdditionalNotesSection";
import { uploadFileToS3 } from "@/lib/upload";

export default function Home() {
  const [lectureData, setLectureData] = useState<LectureData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(true);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    
    try {
      console.log("Uploading slides file to S3:", file.name);
      
      // Upload file to S3
      const uploadResult = await uploadFileToS3(file);
      console.log("File uploaded successfully:", uploadResult.fileUrl);
      
      // TODO: Now process the file with Gemini Flash 2.5 and ElevenLabs APIs
      // You can use uploadResult.fileUrl to access the uploaded file
      
      // Mock data for now - replace with actual processing
      setTimeout(() => {
        setLectureData({
          title: `Lecture from ${uploadResult.fileName}`,
          slides: [
            {
              title: "Introduction",
              content: "Welcome to the lecture",
              notes: `This is an introduction slide with key concepts from ${uploadResult.fileName}...`,
              audioUrl: "/sample-audio.mp3",
            }
          ],
          addNotes: [
            ["Definition of AI", ["This is an introduction slide with key concepts from ${uploadResult.fileName}...", "Hello!!"]],
            ["Example of Something", "This is a conclusion slide with key concepts from ${uploadResult.fileName}..."]
          ]
        });
        setShowUploadModal(false);
        setIsUploading(false);
      }, 2000);
      
    } catch (error) {
      console.error("Upload failed:", error);
      setIsUploading(false);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="h-screen flex bg-bg-darkest">
      
      {/* Left Side - Additional Notes */}
      <AdditionalNotesSection lectureData={lectureData} />

      {/* Left Side - PowerPoint and Chatbot */}
      <div className="flex-1 flex flex-col">
        <PowerPointSection
          lectureData={lectureData}
          isUploading={isUploading}
          showUploadModal={showUploadModal}
          onFileUpload={handleFileUpload}
        />
        
        <ChatbotSection lectureData={lectureData} />
      </div>

    </div>
  );
}

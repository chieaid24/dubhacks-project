"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LectureData } from "@/types/lecture";
import { clearStoredFile } from "@/lib/localFileStorage";

interface AdditionalNotesSectionProps {
  lectureData: LectureData | null;
  onNewStory?: () => void;
}

export default function AdditionalNotesSection({ lectureData, onNewStory }: AdditionalNotesSectionProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCopiedPopup, setShowCopiedPopup] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleNewStory = () => {
    clearStoredFile();
    setIsMenuOpen(false);
    onNewStory?.();
  };

  const handleCopyNotes = async () => {
    if (!lectureData?.add_notes) return;

    // Format the notes as they appear in the UI
    const formattedNotes = lectureData.add_notes.map(note => {
      const header = note[0];
      const body = Array.isArray(note[1]) 
        ? note[1].map(point => `• ${point}`).join('\n')
        : `• ${note[1]}`;
      
      return `${header}\n${body}`;
    }).join('\n\n');

    try {
      await navigator.clipboard.writeText(formattedNotes);
      setShowCopiedPopup(true);
      setTimeout(() => setShowCopiedPopup(false), 700); // Hide after 0.8s
    } catch (err) {
      console.error('Failed to copy notes:', err);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className={`w-120 h-screen flex flex-col transition-colors duration-200 bg-bg-darker`}>
      {/* Menu Button and Header */}
      <div className="p-4 flex-shrink-0">
        <div className="flex items-center justify-between relative">
          <div ref={menuRef} className="flex items-center space-x-3 relative">
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-hover-dark rounded-lg transition-colors"
            >
                <svg className="w-6 h-6 text-text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </motion.button>
            
            {/* Tooltip Menu Below */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ y: 0, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 0, opacity: 0 }}
                  transition={{ 
                    duration: 0.1, 
                    ease: "easeOut"
                  }}
                  className="absolute top-full left-0 mt-2 z-50"
                >
                  <div className="bg-bg-dark border border-border-dark-light rounded-lg shadow-lg p-2 min-w-[120px]">
                    <motion.button
                      onClick={handleNewStory}
                      className="w-full flex items-center space-x-2 px-2 py-2 text-text-white hover:bg-hover-dark rounded-lg transition-colors whitespace-nowrap"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="font-medium">New Story</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 px-16 py-8 overflow-y-auto">
        <div className="flex items-center gap-4 mb-8 relative">
          <h3 className="font-bold text-2xl text-text-white">[Agent's] Notes</h3>
          {lectureData && (
            <button
              onClick={handleCopyNotes}
              className="p-1.5 hover:bg-hover-dark duration-150 rounded-lg transition-colors"
              title="Copy notes"
            >
              <svg className="w-5 h-5 text-text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          )}
          
          {/* Copied Popup */}
          <AnimatePresence>
            {showCopiedPopup && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.1 }}
                className="absolute top-10 left-24/40 -translate-x-1/2 bg-primary/80 text-white px-3 py-2 rounded-lg shadow-lg z-50"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-xs font-medium">Copied!</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {lectureData ? (
          <div className="space-y-4">
            {lectureData.add_notes.map((note, index) => (
              <div key={index} className="">
                <h4 className="text-xl font-medium text-text-white">{note[0]}</h4>
                <div className="text-md text-text-light-gray">
                  {Array.isArray(note[1]) ? (
                    <ul className="list-disc space-y-1 ml-4 pl-2">
                      {note[1].map((point, pointIndex) => (
                        <li key={pointIndex} className="leading-relaxed">{point}</li>
                      ))}
                    </ul>
                  ) : (
                    <ul className="list-disc space-y-1 ml-4 pl-2">
                      <li className="leading-relaxed">{note[1]}</li>
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center text-text-dark-muted mt-8 h-[60vh]">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-bg-dark rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-text-dark-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm">AI-generated notes will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

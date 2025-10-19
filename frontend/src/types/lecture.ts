export interface LectureData {
  filename: string;
  slide_count: number;
  lecture_pages: {
    page_number: number;
    lecture_text: string;
  }[];
  audio_urls: string[];
  add_notes: [string, string | string[]][]; // tuple array
}

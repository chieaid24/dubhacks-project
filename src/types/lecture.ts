export interface Slide {
  title: string;
  content: string;
  notes: string;
  audioUrl?: string;
}

export interface LectureData {
  slides: Slide[];
  title: string;
  addNotes: [string, string | string[]][]; // Array of tuples: (header, body) where body can be string or array of strings
}

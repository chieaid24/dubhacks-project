const STORAGE_KEY = "bedtimeLecture.uploadedFile";

export interface StoredLectureFile {
  name: string;
  type: string;
  size: number;
  lastModified: number;
  dataUrl: string;
  backendData?: any; // ← NEW: stores backend JSON response
}


const isBrowser = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file as data URL."));
      }
    };

    reader.onerror = () => {
      reject(new Error("Unable to read file."));
    };

    reader.readAsDataURL(file);
  });

export const saveFileToLocalStorage = async (
  file: File
): Promise<StoredLectureFile> => {
  const dataUrl = await readFileAsDataUrl(file);

  let backendResult: any = null;

  // STEP 1: Upload file to backend through Next.js API route
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Backend upload failed: ${res.statusText}`);
    }

    backendResult = await res.json();
    console.log("Backend upload result:", backendResult);
  } catch (err) {
    console.error("Failed to upload file to backend:", err);
  }

  // STEP 2: Save file and backend response together in localStorage
  const storedFile: StoredLectureFile = {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: file.lastModified,
    dataUrl,
    // ✅ Add backend results so we can restore them later
    backendData: backendResult,
  } as any; // allow backendData extension
  

  if (isBrowser()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storedFile));
  }

  return storedFile;
};


export const getStoredFile = (): StoredLectureFile | null => {
  if (!isBrowser()) return null;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredLectureFile;
  } catch (error) {
    console.error("Failed to parse stored lecture file.", error);
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const clearStoredFile = () => {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
};

export const recreateFileFromStored = (
  stored: StoredLectureFile
): File | null => {
  if (!isBrowser()) return null;

  try {
    const [metadata, base64Data] = stored.dataUrl.split(",");
    const mimeMatch = metadata.match(/data:(.*);base64/);
    const mimeType = mimeMatch ? mimeMatch[1] : stored.type;

    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i += 1) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    return new File([byteArray], stored.name, {
      type: mimeType,
      lastModified: stored.lastModified,
    });
  } catch (error) {
    console.error("Failed to rebuild stored lecture file.", error);
    return null;
  }
};

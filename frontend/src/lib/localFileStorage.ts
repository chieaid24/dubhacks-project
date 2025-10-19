const STORAGE_KEY = "bedtimeLecture.uploadedFile";

export interface StoredLectureFile {
  name: string;
  type: string;
  size: number;
  lastModified: number;
  dataUrl: string;
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

  const storedFile: StoredLectureFile = {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: file.lastModified,
    dataUrl,
  };

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

export const DOCUMENTS_BUCKET = "application-documents";

export const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_DOCUMENT_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export const ALLOWED_DOCUMENT_EXTENSIONS = [".pdf", ".doc", ".docx"];

export type DocumentType = "resume" | "cover_letter";

export function validateDocumentFile(file: File): string | null {
  if (file.size === 0) return "File is empty";
  if (file.size > MAX_DOCUMENT_SIZE) return "File must be under 5 MB";
  if (!ALLOWED_DOCUMENT_TYPES.has(file.type)) {
    return "Only PDF and Word documents (.pdf, .doc, .docx) are allowed";
  }
  return null;
}

export function buildDocumentPath(
  userId: string,
  applicationId: string,
  type: DocumentType,
  fileName: string
): string {
  const ext = fileName.includes(".")
    ? fileName.slice(fileName.lastIndexOf("."))
    : ".pdf";
  return `${userId}/${applicationId}/${type}${ext}`;
}

export function getDocumentLabel(path: string): string {
  const fileName = path.split("/").pop() ?? "document";
  if (fileName.startsWith("resume")) return "Resume";
  if (fileName.startsWith("cover_letter")) return "Cover Letter";
  return fileName;
}

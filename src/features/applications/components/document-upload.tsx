"use client";

import { useRef } from "react";
import { FileText, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ALLOWED_DOCUMENT_EXTENSIONS } from "@/features/applications/storage";
import { DocumentLink } from "@/features/applications/components/document-link";
import { cn } from "@/lib/utils";

interface DocumentUploadProps {
  id: string;
  label: string;
  existingPath?: string | null;
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
  onClearExisting?: () => void;
  clearExisting?: boolean;
}

export function DocumentUpload({
  id,
  label,
  existingPath,
  selectedFile,
  onFileChange,
  onClearExisting,
  clearExisting = false,
}: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const accept = ALLOWED_DOCUMENT_EXTENSIONS.join(",");
  const showExisting = existingPath && !clearExisting && !selectedFile;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    onFileChange(file);
  }

  function handleClear() {
    onFileChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>

      {showExisting && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
          <DocumentLink path={existingPath} className="min-w-0 flex-1" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={onClearExisting}
            aria-label={`Remove ${label.toLowerCase()}`}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {selectedFile && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
          <span className="flex min-w-0 items-center gap-2 text-sm">
            <FileText className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">{selectedFile.name}</span>
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={handleClear}
            aria-label="Clear selected file"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/30 hover:text-foreground"
        )}
      >
        <Upload className="h-4 w-4" />
        {showExisting || selectedFile ? "Replace file" : "Upload file"}
      </button>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={handleChange}
      />
      <p className="text-xs text-muted-foreground">PDF or Word, max 5 MB</p>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { getSignedDocumentUrl } from "@/features/applications/actions";
import { getDocumentLabel } from "@/features/applications/storage";
import { cn } from "@/lib/utils";

interface DocumentLinkProps {
  path: string;
  className?: string;
}

export function DocumentLink({ path, className }: DocumentLinkProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const result = await getSignedDocumentUrl(path);
      if (cancelled) return;
      if (result.success) {
        setUrl(result.data);
      } else {
        setError(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [path]);

  if (error) {
    return (
      <span className={cn("text-xs text-muted-foreground", className)}>
        {getDocumentLabel(path)} (unavailable)
      </span>
    );
  }

  if (!url) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
        <Loader2 className="h-3 w-3 animate-spin" />
        Loading...
      </span>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onPointerDown={(e) => e.stopPropagation()}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm text-primary hover:underline",
        className
      )}
    >
      <FileText className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{getDocumentLabel(path)}</span>
    </a>
  );
}

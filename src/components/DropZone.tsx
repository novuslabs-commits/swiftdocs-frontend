"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileWarning, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";

const ACCEPTED = {
  "application/pdf": [".pdf"],
  "image/jpeg":      [".jpg", ".jpeg"],
  "image/png":       [".png"],
  "image/tiff":      [".tiff", ".tif"],
};

const MAX_SIZE = 3 * 1024 * 1024; // 3 MB — mirrors server

export interface RejectedFile {
  name: string;
  reason: string;
}

interface Props {
  onFiles: (accepted: File[], rejected: RejectedFile[]) => void;
  disabled?: boolean;
}

const RULES = ["PDF or image", "Single page", "≤ 3 MB"] as const;

export default function DropZone({ onFiles, disabled }: Props) {
  const [errors, setErrors] = useState<string[]>([]);

  const onDrop = useCallback<(acceptedFiles: File[], fileRejections: any[], event: any) => void>(
    (accepted, rejected) => {
      setErrors([]);

      const rejectedFiles: RejectedFile[] = rejected.map(({ file, errors }) => {
        const code = errors[0]?.code ?? "";
        const reason =
          code === "file-too-large"    ? "Too large (max 3 MB)" :
          code === "file-invalid-type" ? "Unsupported type" :
          errors[0]?.message ?? "Rejected";
        return { name: file.name, reason };
      });

      if (rejected.length > 0) {
        setErrors(
          rejected.map(({ file, errors }) => {
            const code = errors[0]?.code ?? "";
            if (code === "file-too-large")    return `${file.name} — too large (max 3 MB)`;
            if (code === "file-invalid-type") return `${file.name} — unsupported type`;
            return `${file.name} — ${errors[0]?.message}`;
          })
        );
      }

      onFiles(accepted, rejectedFiles);
    },
    [onFiles]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: MAX_SIZE,
    disabled,
  });

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        aria-label="File upload area. Drag and drop files, or click to browse."
        className={cn(
          "relative overflow-hidden rounded-xl border transition-all duration-200",
          "cursor-pointer select-none outline-none group",
          !isDragActive && !disabled && [
            "border-sw-border bg-sw-surface",
            "hover:border-sw-primary/40 hover:bg-sw-primary/[0.018]",
          ],
          isDragActive && !isDragReject && [
            "border-sw-primary bg-sw-primary/[0.04]",
            "shadow-card-md scale-[1.004]",
          ],
          isDragReject && "border-sw-danger bg-sw-danger/[0.04]",
          disabled && "opacity-60 cursor-not-allowed border-sw-border bg-sw-surface"
        )}
      >
        {/* Signature: glowing top accent bar — appears on drag */}
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-x-0 top-0 h-[3px] rounded-t-xl transition-opacity duration-300",
            isDragActive && !isDragReject
              ? "opacity-100 bg-gradient-to-r from-sw-primary via-sw-accent to-sw-primary"
              : isDragReject
              ? "opacity-100 bg-sw-danger"
              : "opacity-0 bg-sw-primary"
          )}
        />

        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-3 sm:gap-4 px-4 py-10 sm:px-8 sm:py-14 text-center">
          {/* Icon */}
          <div
            className={cn(
              "flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl transition-all duration-200",
              isDragReject
                ? "bg-sw-danger/10 text-sw-danger"
                : isDragActive
                ? "bg-sw-primary/15 text-sw-primary scale-110"
                : "bg-sw-bg text-sw-muted group-hover:bg-sw-primary/10 group-hover:text-sw-primary"
            )}
          >
            {isDragReject
              ? <FileWarning size={22} className="sm:hidden" aria-hidden="true" />
              : <UploadCloud size={22} className="sm:hidden" aria-hidden="true" />
            }
            {isDragReject
              ? <FileWarning size={28} className="hidden sm:block" aria-hidden="true" />
              : <UploadCloud size={28} className="hidden sm:block" aria-hidden="true" />
            }
          </div>

          {/* Label */}
          <div>
            {isDragActive && !isDragReject ? (
              <p className="text-base font-semibold text-sw-primary">Release to upload</p>
            ) : isDragReject ? (
              <p className="text-base font-semibold text-sw-danger">File not accepted</p>
            ) : (
              <>
                <p className="text-base font-semibold text-sw-text">
                  Drag files here, or{" "}
                  <span className="text-sw-primary underline underline-offset-2 decoration-sw-primary/40">
                    browse
                  </span>
                </p>
                <p className="mt-1 text-sm text-sw-muted">
                  Upload multiple files at once
                </p>
              </>
            )}
          </div>

          {/* Constraint chips — hidden while dragging to reduce visual noise */}
          {!isDragActive && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2" aria-label="File requirements">
              {RULES.map((rule) => (
                <span
                  key={rule}
                  className={cn(
                    "inline-flex items-center rounded-full border border-sw-border whitespace-nowrap",
                    "bg-sw-bg px-2.5 py-0.5 sm:px-3 text-[11px] sm:text-xs font-medium text-sw-muted"
                  )}
                >
                  {rule}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Per-file rejection errors */}
      {errors.length > 0 && (
        <ul role="alert" aria-label="File errors" className="space-y-1 pt-1">
          {errors.map((err, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-sw-danger">
              <XCircle size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>{err}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

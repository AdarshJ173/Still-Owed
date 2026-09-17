import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "./ui/alert-dialog";
import { AlertCircle, Trash2 } from "lucide-react";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = false,
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        style={{
          maxWidth: "480px",
          background: "var(--white)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius)",
          boxShadow: "0 16px 40px rgba(31, 42, 50, 0.18)",
          padding: "2rem",
        }}
      >
        <AlertDialogHeader>
          <div style={{ display: "flex", alignItems: "center", gap: ".65rem", marginBottom: ".4rem" }}>
            {isDestructive ? (
              <div
                style={{
                  width: "2.2rem",
                  height: "2.2rem",
                  borderRadius: "50%",
                  background: "var(--danger-pale)",
                  color: "var(--danger)",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <Trash2 size={17} aria-hidden="true" />
              </div>
            ) : (
              <div
                style={{
                  width: "2.2rem",
                  height: "2.2rem",
                  borderRadius: "50%",
                  background: "var(--blue-pale)",
                  color: "var(--blue)",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <AlertCircle size={17} aria-hidden="true" />
              </div>
            )}
            <AlertDialogTitle
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.6rem",
                fontWeight: 600,
                margin: 0,
                color: "var(--ink)",
                lineHeight: 1.15,
              }}
            >
              {title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription
            style={{
              color: "var(--ink-soft)",
              fontSize: ".95rem",
              lineHeight: 1.45,
              marginTop: ".5rem",
            }}
          >
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter style={{ marginTop: "1.75rem", display: "flex", gap: ".75rem", justifyContent: "flex-end" }}>
          <AlertDialogCancel
            className="button button-quiet button-small"
            disabled={loading}
            style={{ margin: 0 }}
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            className={`button ${isDestructive ? "button-danger" : "button-primary"} button-small`}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={loading}
            style={{ margin: 0 }}
          >
            {loading ? "Processing..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

import { useEffect, useId, useRef } from 'react';
import { Button } from './Button';
import styles from './ui.module.css';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirming?: boolean;
  className?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirming = false,
  className = '',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelHandler = useRef(onCancel);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    cancelHandler.current = onCancel;
  }, [onCancel]);

  useEffect(() => {
    if (!open) return undefined;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const focusable = dialog?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [];
    (focusable[0] ?? dialog)?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        cancelHandler.current();
        return;
      }
      if (event.key !== 'Tab' || !dialog) return;

      const elements = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (elements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = elements[0];
      const last = elements[elements.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !dialog.contains(active))) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
        event.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={styles.dialogBackdrop}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        aria-modal="true"
        className={[styles.dialog, className].filter(Boolean).join(' ')}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <h2 className={styles.dialogTitle} id={titleId}>
          {title}
        </h2>
        <p className={styles.dialogDescription} id={descriptionId}>
          {description}
        </p>
        <div className={styles.dialogActions}>
          <Button onClick={onCancel} variant="secondary">
            {cancelLabel}
          </Button>
          <Button disabled={confirming} onClick={onConfirm} variant="danger">
            {confirming ? 'Working…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

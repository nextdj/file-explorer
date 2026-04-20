"use client";

import { useEffect, useRef } from "react";
import { cn } from "../lib/utils";

interface InlineNameInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  busy?: boolean;
  selectKey?: number;
  className?: string;
}

export function InlineNameInput({
  value,
  onChange,
  onSubmit,
  onCancel,
  busy = false,
  selectKey = 0,
  className,
}: InlineNameInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const committedRef = useRef(false);
  const didAutoSelectRef = useRef(false);
  const isComposingRef = useRef(false);

  useEffect(() => {
    if (didAutoSelectRef.current) return;

    const input = inputRef.current;
    if (!input) return;

    didAutoSelectRef.current = true;
    input.focus();

    const dotIndex = value.lastIndexOf(".");
    const hasExtension = dotIndex > 0 && dotIndex < value.length - 1;

    if (hasExtension) {
      input.setSelectionRange(0, dotIndex);
      return;
    }

    input.select();
  }, [value]);

  useEffect(() => {
    if (!busy) {
      committedRef.current = false;
    }
  }, [busy]);

  useEffect(() => {
    if (selectKey === 0) return;

    const input = inputRef.current;
    if (!input) return;

    committedRef.current = false;
    input.focus();

    const dotIndex = value.lastIndexOf(".");
    const hasExtension = dotIndex > 0 && dotIndex < value.length - 1;

    if (hasExtension) {
      input.setSelectionRange(0, dotIndex);
      return;
    }

    input.select();
  }, [selectKey, value]);

  const commit = () => {
    if (committedRef.current) return;
    committedRef.current = true;
    onSubmit();
  };

  const cancel = () => {
    if (committedRef.current) return;
    committedRef.current = true;
    onCancel();
  };

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onCompositionStart={() => {
        isComposingRef.current = true;
      }}
      onCompositionEnd={() => {
        isComposingRef.current = false;
      }}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (isComposingRef.current) return;

        if (e.key === "Enter") {
          e.preventDefault();
          commit();
        }

        if (e.key === "Escape") {
          e.preventDefault();
          cancel();
        }
      }}
      onBlur={commit}
      className={cn(
        "h-7 w-full rounded-md border border-(--_fe-border) bg-(--_fe-bg) px-2 text-sm text-(--_fe-selected) outline-none",
        "focus:border-(--_fe-selected) focus:ring-0",
        className,
      )}
    />
  );
}

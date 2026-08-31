"use client";

import { useState, useCallback } from "react";

/**
 * Replaces native browser validation bubbles with inline red error text.
 * Spread `fieldProps(name)` onto any input/select/textarea with a `name` attribute.
 */
export function useFormValidation() {
  const [errors, setErrors] = useState({});

  const handleInvalid = useCallback((e) => {
    e.preventDefault();
    const { name, validationMessage } = e.target;
    if (name) setErrors((prev) => ({ ...prev, [name]: validationMessage }));
  }, []);

  const handleChange = useCallback((e) => {
    const { name, validity, validationMessage } = e.target;
    if (!name) return;
    setErrors((prev) => {
      if (validity.valid) {
        if (!(name in prev)) return prev;
        const next = { ...prev };
        delete next[name];
        return next;
      }
      return prev[name] === validationMessage ? prev : { ...prev, [name]: validationMessage };
    });
  }, []);

  const clearError = useCallback((name) => {
    setErrors((prev) => {
      if (!(name in prev)) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const fieldProps = useCallback(
    (name) => ({
      name,
      onInvalid: handleInvalid,
      onInput: handleChange,
    }),
    [handleInvalid, handleChange]
  );

  return { errors, fieldProps, clearError, handleInvalid, handleChange };
}

export function FieldError({ message }) {
  if (!message) return null;
  return (
    <span
      style={{
        display: "block",
        color: "#dc2626",
        fontSize: 12,
        fontWeight: 600,
        marginTop: 6,
      }}
    >
      {message}
    </span>
  );
}

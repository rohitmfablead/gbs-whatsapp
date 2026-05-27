// src/services/errorHandler.js

import { errorContextRef } from "../contexts/ErrorContext";

export const errorHandler = (error) => {
  const message =
    error.response?.data?.message ||
    error.message ||
    "Something went wrong. Please try again.";

  if (errorContextRef.current) {
    errorContextRef.current.setError(message);
  }
};

import React from "react";

export const BaseLoading = ({ message = "Loading..." }) => {
  const dots = Array(4).fill(0); // 5 dots
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
      {/* Bouncing dots */}
      <div className="flex space-x-2 mb-4">
        {dots.map((_, i) => (
          <span
            key={i}
            className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          ></span>
        ))}
      </div>

      {/* Optional message */}
      <p className="text-blue-100 text-lg font-medium animate-fadeIn">{message}</p>
    </div>
  );
};

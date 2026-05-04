import { useState } from "react";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-7 w-7",
};

export default function StarRating({
  rating,
  onRatingChange,
  size = "md",
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const isInteractive = !!onRatingChange;
  const displayed = hovered ?? rating;

  return (
    <div className={`flex items-center gap-0.5 ${isInteractive ? "cursor-pointer" : ""}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = displayed >= star;
        const halfFilled = !filled && displayed >= star - 0.5;

        return (
          <button
            key={star}
            type="button"
            disabled={!isInteractive}
            onClick={() => isInteractive && onRatingChange(star)}
            onMouseEnter={() => isInteractive && setHovered(star)}
            onMouseLeave={() => isInteractive && setHovered(null)}
            className={`focus:outline-none ${
              isInteractive
                ? "hover:scale-110 transition-transform"
                : "cursor-default"
            }`}
            aria-label={`${star} star${star !== 1 ? "s" : ""}`}
          >
            <svg
              className={`${sizeClasses[size]} ${
                filled
                  ? "text-yellow-400"
                  : halfFilled
                  ? "text-yellow-300"
                  : "text-gray-300"
              }`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

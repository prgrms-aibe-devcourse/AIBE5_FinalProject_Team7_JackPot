import { useState } from 'react';

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
}

export function StarRatingInput({ value, onChange, max = 5 }: StarRatingInputProps) {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);
  const scores = Array.from({ length: max }, (_, index) => index + 1);
  const displayValue = hoveredValue ?? value;

  return (
    <div
      className="wf-star-rating"
      role="radiogroup"
      aria-label="별점 선택"
      onMouseLeave={() => setHoveredValue(null)}
    >
      {scores.map((score) => (
        <button
          key={score}
          type="button"
          className={`wf-star-rating__button${score <= displayValue ? ' wf-star-rating__button--filled' : ''}`}
          onClick={() => onChange(score)}
          onMouseEnter={() => setHoveredValue(score)}
          onFocus={() => setHoveredValue(score)}
          onBlur={() => setHoveredValue(null)}
          role="radio"
          aria-checked={value === score}
          aria-label={`${score}점`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

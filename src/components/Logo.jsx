import React from 'react';

const Logo = ({ size = 28, className = '', title = 'PitchAssess' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    role="img"
    aria-label={title}
    className={className}
  >
    <title>{title}</title>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 5h8a6.5 6.5 0 0 1 0 13h-4.5v8H8V5zm3.5 3v7h4.5a3.5 3.5 0 0 0 0-7h-4.5z"
      fill="currentColor"
    />
    <path
      d="M18.5 22.8l3.1-3.1 2.5 2.5 4-4.7"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M25.2 16.8h3v3"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Logo;

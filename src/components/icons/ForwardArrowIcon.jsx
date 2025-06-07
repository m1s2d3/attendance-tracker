import React from 'react';

const ForwardArrowIcon = ({ className = '', width = 16, height = 16 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    width={width}
    height={height}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="M9 5l7 7-7 7" />
  </svg>
);

export default ForwardArrowIcon;

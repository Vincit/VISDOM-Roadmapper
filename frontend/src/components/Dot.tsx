import React from 'react';

export const Dot: React.FC<{ fill: string }> = ({ fill }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="7" cy="7" r="7" fill={fill} />
  </svg>
);

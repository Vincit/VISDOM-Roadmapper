import { FC } from 'react';

export const Dot: FC<{ fill: string; diameter?: number }> = ({
  fill,
  diameter = 14,
}) => (
  <svg
    width={diameter}
    height={diameter}
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="7" cy="7" r="7" fill={fill} />
  </svg>
);

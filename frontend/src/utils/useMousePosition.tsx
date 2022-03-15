import { useState, useEffect } from 'react';

export const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const updateMousePosition = (ev: MouseEvent) => {
    setMousePosition({ x: ev.clientX, y: ev.clientY });
  };

  useEffect(() => {
    window.addEventListener('mousemove', updateMousePosition);

    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  return mousePosition;
};

interface MousePosition {
  x: number;
  y: number;
}

export const isMouseInElement = (
  event: MousePosition,
  element: HTMLDivElement,
) => {
  const { left, right, top, bottom } = element.getBoundingClientRect();
  const { x, y } = event;
  if (x < left || x >= right) return false;
  if (y < top || y >= bottom) return false;
  return true;
};

export const scrollToDirection = (
  event: MousePosition,
  element: HTMLDivElement,
) => {
  const { left, right, top, bottom } = element.getBoundingClientRect();
  const { x, y } = event;
  const directions = {
    left: x < left,
    right: x > right,
    top: y < top,
    bottom: y > bottom,
  };
  if (Object.values(directions).every((value) => !value)) return false;
  return directions;
};

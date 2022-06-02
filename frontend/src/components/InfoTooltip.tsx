import React from 'react';
import { ControlledTooltip } from './ControlledTooltip';

export const InfoTooltip: React.FC<{
  title: React.ReactNode;
  children?: any;
}> = ({ title, children }) => (
  <ControlledTooltip title={title}>{children}</ControlledTooltip>
);

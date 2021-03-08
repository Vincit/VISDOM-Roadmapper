import React from 'react';

export const Debug = ({
  show = process.env.NODE_ENV === 'development',
  children,
}: {
  show?: boolean;
  children?: any;
}) => (show && children ? <>{children}</> : null);

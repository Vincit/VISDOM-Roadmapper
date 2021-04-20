import React from 'react';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';

export const RatingsButton: React.FC<{
  onClick?: (event: React.MouseEvent<SVGElement, MouseEvent>) => void;
  href?: string;
}> = ({ onClick, href }) => {
  if (href && href.length > 0) {
    return (
      <a href={href}>
        <QuestionAnswerIcon
          onClick={onClick}
          style={{
            width: 24,
            height: 24,
            cursor: 'pointer',
            opacity: 0.25,
            fill: 'black',
            color: 'black',
          }}
        />
      </a>
    );
  }
  return (
    <QuestionAnswerIcon
      onClick={onClick}
      style={{
        width: 24,
        height: 24,
        cursor: 'pointer',
        opacity: 0.25,
        fill: 'black',
        color: 'black',
      }}
    />
  );
};

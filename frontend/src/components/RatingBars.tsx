import React from 'react';
import Rating from 'react-rating';
import { TaskRatingDimension } from '../redux/roadmaps/types';
import {
  BusinessValueEmpty,
  BusinessValueFilled,
  RequiredWorkEmpty,
  RequiredWorkFilled,
} from './RatingIcons';

interface RatingBarProps {
  onChange?: (value: number) => void;
  dimension: TaskRatingDimension;
  initialValue: number;
  readonly?: boolean;
}

export const TaskRatingBar: React.FC<RatingBarProps> = ({
  dimension,
  onChange,
  initialValue,
  readonly,
}) => {
  return (
    <Rating
      initialRating={initialValue}
      start={0}
      stop={10}
      onChange={onChange}
      emptySymbol={
        dimension === TaskRatingDimension.BusinessValue ? (
          <BusinessValueEmpty />
        ) : (
          <RequiredWorkEmpty />
        )
      }
      fullSymbol={
        dimension === TaskRatingDimension.BusinessValue ? (
          <BusinessValueFilled />
        ) : (
          <RequiredWorkFilled />
        )
      }
      readonly={readonly}
    />
  );
};

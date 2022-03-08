import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import classNames from 'classnames';
import {
  TaskRatingDimension,
  RoleType,
} from '../../../shared/types/customTypes';
import { userRoleSelector } from '../redux/user/selectors';
import { TaskRatingBar } from './RatingBars';
import { TextArea } from './forms/FormField';
import css from './TaskRatingWidget.module.scss';

const classes = classNames.bind(css);

interface TaskRatingWidgetProps {
  initialRating?: {
    value: number;
    comment: string | undefined;
  };
  onRatingChange?: (rating: {
    value: number;
    comment: string | undefined;
  }) => void;
  ratingDimension: TaskRatingDimension;
  name: string;
}

export const TaskRatingWidget: FC<TaskRatingWidgetProps> = ({
  initialRating,
  onRatingChange,
  ratingDimension,
  name,
}) => {
  const { t } = useTranslation();
  const role = useSelector(userRoleSelector, shallowEqual);
  const [rating, setRating] = useState(
    initialRating || {
      value: 0,
      comment: undefined,
    },
  );

  const [commentBoxOpen, setCommentBoxOpen] = useState(!!initialRating?.value);

  const ratingChanged = (value: number) => {
    setRating({ ...rating, value });
    if (onRatingChange) onRatingChange({ ...rating, value });
    if (value) setCommentBoxOpen(true);
    else setCommentBoxOpen(false);
  };

  const commentChanged = (comment: string) => {
    setRating({ ...rating, comment });
    if (onRatingChange) onRatingChange({ ...rating, comment });
  };

  const shouldShow =
    ratingDimension === TaskRatingDimension.BusinessValue
      ? role !== RoleType.Developer
      : role !== RoleType.Business;

  const renderRatingBars = () =>
    shouldShow && (
      <div className={classes(css.ratingBarWrapper)}>
        <TaskRatingBar
          name={name}
          dimension={ratingDimension}
          initialValue={rating.value}
          onChange={ratingChanged}
        />
      </div>
    );

  const renderCommentBox = () =>
    commentBoxOpen && (
      <div className={classes(css.commentBoxWrapper, css.formGroup)}>
        <TextArea
          name="description"
          id="description"
          draggable="false"
          placeholder={t('Add a comment')}
          value={rating.comment}
          onChange={(e) => commentChanged(e.currentTarget.value)}
        />
      </div>
    );

  return (
    <div className={classes(css.ratingWrapper)}>
      {renderRatingBars()}
      {renderCommentBox()}
    </div>
  );
};

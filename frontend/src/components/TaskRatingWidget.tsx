import { FC, useState } from 'react';
import { Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import classNames from 'classnames';
import {
  TaskRatingDimension,
  RoleType,
} from '../../../shared/types/customTypes';
import { chosenRoadmapSelector } from '../redux/roadmaps/selectors';
import { Roadmap } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { TaskRatingBar } from './RatingBars';
import { getType } from '../utils/UserUtils';
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
}

export const TaskRatingWidget: FC<TaskRatingWidgetProps> = ({
  initialRating,
  onRatingChange,
  ratingDimension,
}) => {
  const { t } = useTranslation();
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );
  const role = getType(userInfo?.roles, currentRoadmap?.id);
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
      : role !== RoleType.Customer && role !== RoleType.Business;

  const renderRatingBars = () =>
    shouldShow && (
      <div className={classes(css.ratingBarWrapper)}>
        <TaskRatingBar
          dimension={ratingDimension}
          initialValue={rating.value}
          onChange={ratingChanged}
        />
      </div>
    );

  const renderCommentBox = () =>
    commentBoxOpen && (
      <Form.Group className={classes(css.commentBoxWrapper)}>
        <TextArea
          name="description"
          id="description"
          draggable="false"
          placeholder={t('Add a comment')}
          value={rating.comment}
          onChange={(e) => commentChanged(e.currentTarget.value)}
        />
      </Form.Group>
    );

  return (
    <div className={classes(css.ratingWrapper)}>
      {renderRatingBars()}
      {renderCommentBox()}
    </div>
  );
};

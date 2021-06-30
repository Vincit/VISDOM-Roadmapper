import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import { ChatDots } from 'react-bootstrap-icons';
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

export const TaskRatingWidget: React.FC<TaskRatingWidgetProps> = ({
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

  const [commentBoxOpen, setCommentBoxOpen] = useState(false);

  const ratingChanged = (value: number) => {
    setRating({ ...rating, value });
    if (onRatingChange) onRatingChange({ ...rating, value });
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
      <Form.Group>
        <div className="d-flex justify-content-around">
          <TaskRatingBar
            dimension={ratingDimension}
            initialValue={rating.value}
            onChange={ratingChanged}
          />
          <ChatDots
            className={classes(css.commentButton)}
            onClick={() => setCommentBoxOpen(true)}
          />
        </div>
      </Form.Group>
    );

  const renderCommentBox = () => {
    return (
      <Form.Group className={classes(css.commentBoxWrapper)}>
        <TextArea
          required
          name="description"
          id="description"
          draggable="false"
          placeholder={t('Comment your rating...')}
          value={rating.comment}
          onChange={(e) => commentChanged(e.currentTarget.value)}
        />
        <span
          className={classes(css.closeCommentButton)}
          onClick={() => setCommentBoxOpen(false)}
          aria-hidden="true"
        >
          &times;
        </span>
      </Form.Group>
    );
  };

  return (
    <div className="position-relative">
      {commentBoxOpen && renderCommentBox()} {renderRatingBars()}
    </div>
  );
};

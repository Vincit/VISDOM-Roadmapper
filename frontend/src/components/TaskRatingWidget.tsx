import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import { ChatDots } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import { TaskRatingDimension } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo, UserType } from '../redux/user/types';
import { TaskRatingBar } from './RatingBars';
import classNames from 'classnames';
import css from './TaskRatingWidget.module.scss';

const classes = classNames.bind(css);

interface TaskRatingWidgetProps {
  initialBusinessValueRating?: {
    value: number;
    comment: string | undefined;
  };
  initialRequiredWorkRating?: {
    value: number;
    comment: string | undefined;
  };
  onBusinessRatingChange?: (rating: {
    value: number;
    comment: string | undefined;
  }) => void;
  onRequiredWorkRatingChange?: (rating: {
    value: number;
    comment: string | undefined;
  }) => void;
}

export const TaskRatingWidget: React.FC<TaskRatingWidgetProps> = ({
  initialBusinessValueRating,
  initialRequiredWorkRating,
  onBusinessRatingChange,
  onRequiredWorkRatingChange,
}) => {
  const { t } = useTranslation();
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const [businessValueRating, setBusinessValueRating] = useState(
    initialBusinessValueRating || {
      value: 0,
      comment: undefined,
    },
  );
  const [requiredWorkRating, setRequiredWorkRating] = useState(
    initialRequiredWorkRating || {
      value: 0,
      comment: undefined,
    },
  );
  const [commentBoxOpen, setCommentBoxOpen] = useState(false);
  const [commentBoxTarget, setCommentBoxTarget] = useState(
    TaskRatingDimension.BusinessValue,
  );

  const businessValueChanged = (value: number) => {
    setBusinessValueRating({ ...businessValueRating, value });
    if (onBusinessRatingChange)
      onBusinessRatingChange({ ...businessValueRating, value });
  };

  const businessCommentChanged = (comment: string) => {
    setBusinessValueRating({ ...businessValueRating, comment });
    if (onBusinessRatingChange)
      onBusinessRatingChange({ ...businessValueRating, comment });
  };

  const requiredWorkValueChanged = (value: number) => {
    setRequiredWorkRating({ ...requiredWorkRating, value });
    if (onRequiredWorkRatingChange)
      onRequiredWorkRatingChange({ ...requiredWorkRating, value });
  };

  const requiredWorkCommentChanged = (comment: string) => {
    setRequiredWorkRating({ ...requiredWorkRating, comment });
    if (onRequiredWorkRatingChange)
      onRequiredWorkRatingChange({ ...requiredWorkRating, comment });
  };

  const openCommentBox = (whichRating: TaskRatingDimension) => {
    setCommentBoxOpen(true);
    setCommentBoxTarget(whichRating);
  };

  const onCommentChange = (comment: string) => {
    if (commentBoxTarget === TaskRatingDimension.BusinessValue) {
      businessCommentChanged(comment);
    } else {
      requiredWorkCommentChanged(comment);
    }
  };

  const renderRatingBars = () => {
    return (
      <>
        {userInfo!.type !== UserType.DeveloperUser && (
          <Form.Group>
            <div className="d-flex justify-content-around">
              <TaskRatingBar
                dimension={TaskRatingDimension.BusinessValue}
                initialValue={businessValueRating.value}
                onChange={businessValueChanged}
              />
              <ChatDots 
                className={classes(css.commentButton)}
                onClick={() =>
                  openCommentBox(TaskRatingDimension.BusinessValue)
                }
              />
            </div>
          </Form.Group>
        )}
        {userInfo!.type !== UserType.CustomerUser &&
          userInfo!.type !== UserType.BusinessUser && (
            <Form.Group>
              <div className="d-flex justify-content-around">
                <TaskRatingBar
                  dimension={TaskRatingDimension.RequiredWork}
                  initialValue={requiredWorkRating.value}
                  onChange={requiredWorkValueChanged}
                />
                <ChatDots 
                  className={classes(css.commentButton)}
                  onClick={() =>
                    openCommentBox(TaskRatingDimension.RequiredWork)
                  }
                />
              </div>
            </Form.Group>
          )}
      </>
    );
  };

  const renderCommentBox = () => {
    return (
      <Form.Group className={classes(css.commentBoxWrapper)}>
        <Form.Control
          required
          as="textarea"
          name="description"
          id="description"
          draggable="false"
          placeholder={t('Comment your rating...')}
          value={
            commentBoxTarget === TaskRatingDimension.BusinessValue
              ? businessValueRating.comment
              : requiredWorkRating.comment
          }
          onChange={(e) => onCommentChange(e.currentTarget.value)}
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

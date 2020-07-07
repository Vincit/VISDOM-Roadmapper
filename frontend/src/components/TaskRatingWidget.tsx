import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import { ChatDots } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { TaskRatingDimension } from '../redux/roadmaps/types';
import { TaskRatingBar } from './RatingBars';

const CommentButton = styled(ChatDots)`
  position: relative;
  top: 0.15em;
  cursor: pointer;
  width: 1.5em;
  height: 1.5em;
`;

const CloseCommentButton = styled.span`
  position: absolute;
  top: -0.5em;
  right: 0;
  cursor: pointer;
  user-select: none;
  font-size: 50px;
  margin: 0px;
`;

const CommentBoxWrapper = styled(Form.Group)`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  margin-left: 2em;
  margin-right: 2em;
  z-index: 999;
  textarea {
    resize: none;
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    height: 6em;
  }
`;

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
        <Form.Group>
          <div className="d-flex justify-content-around">
            <TaskRatingBar
              dimension={TaskRatingDimension.BusinessValue}
              initialValue={businessValueRating.value}
              onChange={businessValueChanged}
            />
            <CommentButton
              onClick={() => openCommentBox(TaskRatingDimension.BusinessValue)}
            />
          </div>
        </Form.Group>
        <Form.Group>
          <div className="d-flex justify-content-around">
            <TaskRatingBar
              dimension={TaskRatingDimension.RequiredWork}
              initialValue={requiredWorkRating.value}
              onChange={requiredWorkValueChanged}
            />
            <CommentButton
              onClick={() => openCommentBox(TaskRatingDimension.RequiredWork)}
            />
          </div>
        </Form.Group>
      </>
    );
  };

  const renderCommentBox = () => {
    return (
      <CommentBoxWrapper>
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
        <CloseCommentButton
          onClick={() => setCommentBoxOpen(false)}
          aria-hidden="true"
        >
          &times;
        </CloseCommentButton>
      </CommentBoxWrapper>
    );
  };

  return (
    <div className="position-relative">
      {commentBoxOpen && renderCommentBox()} {renderRatingBars()}
    </div>
  );
};

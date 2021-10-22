import { TextareaAutosize } from '@material-ui/core';
import classNames from 'classnames';
import { FC, useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { CloseButton, ConfirmButton, EditButton } from './forms/SvgButton';
import { LoadingSpinner } from './LoadingSpinner';
import css from './TaskOverview.module.scss';

const classes = classNames.bind(css);

interface WithButtonsProps {
  onOk: (newValue: string) => string | undefined;
  value: string;
  isLoading: boolean;
}

const withButtons = (Component: typeof EditableText) => ({
  ...props
}: WithButtonsProps) => {
  const [editOpen, setEditOpen] = useState(false);
  const [editText, setEditText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { onOk, ...passThroughProps } = props;

  const handleTextChange = (event: React.FormEvent<HTMLTextAreaElement>) => {
    setEditText(event.currentTarget.value);
  };

  const handleConfirm = () => {
    const returnedError = onOk(editText);
    if (returnedError) setErrorMessage(returnedError);
    setEditText('');
    setEditOpen(false);
  };

  const handleCancel = () => {
    setErrorMessage('');
    setEditText('');
    setEditOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    switch (event.key) {
      case 'Enter':
        handleConfirm();
        break;
      case 'Escape':
        handleCancel();
        break;
      default:
        break;
    }
  };

  return (
    <>
      <Component
        editOpen={editOpen}
        editText={editText}
        onTextChange={handleTextChange}
        onKeyDown={handleKeyDown}
        errorMessage={errorMessage}
        {...passThroughProps}
      />
      {editOpen ? (
        <div className={classes(css.buttonsDiv)}>
          <CloseButton onClick={handleCancel} />
          {errorMessage === '' && <ConfirmButton onClick={handleConfirm} />}
        </div>
      ) : (
        <div className={classes(css.editButtonDiv)}>
          <EditButton
            fontSize="medium"
            onClick={() => {
              setEditOpen(true);
            }}
          />
        </div>
      )}
    </>
  );
};

export const EditableText: FC<{
  editOpen: boolean;
  editText: string;
  onTextChange: (event: React.FormEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  errorMessage: string;
  value: string;
  isLoading: boolean;
}> = ({
  editOpen,
  editText,
  onTextChange,
  value,
  errorMessage,
  isLoading,
  onKeyDown,
}) => {
  return (
    <>
      {editOpen ? (
        <>
          {isLoading && (
            <div className={classes(css.flexGrow)}>
              <LoadingSpinner />
            </div>
          )}
          {!isLoading && errorMessage === '' && (
            <TextareaAutosize
              className={classes(css.input)}
              value={editText}
              onChange={onTextChange}
              autoComplete="off"
              rows={1}
              onKeyDown={onKeyDown}
            />
          )}
          {errorMessage !== '' && (
            <div className={classes(css.flexGrow)}>
              <Alert show={errorMessage.length > 0} variant="danger">
                {errorMessage}
              </Alert>
            </div>
          )}
        </>
      ) : (
        <>
          <div className={classes(css.value)}>{value}</div>
        </>
      )}
    </>
  );
};

export const EditableTextWithButtons = withButtons(EditableText);

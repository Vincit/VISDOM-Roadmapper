import { TextareaAutosize } from '@material-ui/core';
import classNames from 'classnames';
import { FC, useState, KeyboardEvent, FormEvent } from 'react';
import { Alert } from 'react-bootstrap';
import { CloseButton, ConfirmButton, EditButton } from './forms/SvgButton';
import { LoadingSpinner } from './LoadingSpinner';
import css from './EditableText.module.scss';

const classes = classNames.bind(css);

interface WithButtonsProps {
  onOk: (newValue: string, fieldId: string) => Promise<string | void>;
  value: string;
  fieldId: string;
  format: string | undefined;
}

const withButtons = (Component: typeof EditableText) => ({
  onOk,
  value,
  fieldId,
  format,
}: WithButtonsProps) => {
  const [editOpen, setEditOpen] = useState(false);
  const [editText, setEditText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTextChange = (event: FormEvent<HTMLTextAreaElement>) => {
    setEditText(event.currentTarget.value);
  };

  const handleConfirm = () => {
    if (editText !== '') {
      setIsLoading(true);
      onOk(editText, fieldId).then((returnedError) => {
        if (returnedError) setErrorMessage(returnedError);
        else {
          setEditOpen(false);
        }
        setEditText('');
        setIsLoading(false);
      });
    } else {
      setErrorMessage("Field can't be empty.");
    }
  };

  const handleCancel = () => {
    setErrorMessage('');
    setEditText('');
    setEditOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
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
              setEditText(value);
              setEditOpen(true);
            }}
          />
        </div>
      )}
      <Component
        editOpen={editOpen}
        editText={editText}
        onTextChange={handleTextChange}
        onKeyDown={handleKeyDown}
        errorMessage={errorMessage}
        isLoading={isLoading}
        value={value}
        format={format}
      />
    </>
  );
};

export const EditableText: FC<{
  editOpen: boolean;
  editText: string;
  onTextChange: (event: FormEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  errorMessage: string;
  value: string;
  isLoading: boolean;
  format: string | undefined;
}> = ({
  editOpen,
  editText,
  onTextChange,
  onKeyDown,
  value,
  errorMessage,
  isLoading,
  format,
}) => {
  return editOpen ? (
    <>
      {isLoading && (
        <div className={classes(css.flexGrow)}>
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && errorMessage === '' && (
        <TextareaAutosize
          className={classes(css.input, css[format ?? ''])}
          value={editText}
          onChange={onTextChange}
          autoComplete="off"
          minRows={1}
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
      <div className={classes(css.value, css[format ?? ''])}>{value}</div>
    </>
  );
};

export const EditableTextWithButtons = withButtons(EditableText);

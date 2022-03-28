import classNames from 'classnames';
import {
  FC,
  useState,
  useRef,
  KeyboardEvent,
  FormEvent,
  ComponentPropsWithoutRef,
} from 'react';
import { CloseButton, ConfirmButton, EditButton } from './forms/SvgButton';
import { TextAreaAutosize } from './forms/FormField';
import { LoadingSpinner } from './LoadingSpinner';
import css from './EditableText.module.scss';

const classes = classNames.bind(css);

interface WithButtonsProps {
  onOk: (newValue: string, fieldId: string) => Promise<string | void>;
  value: string;
  fieldId: string;
  format: string | undefined;
  multiline?: true;
}

const withButtons = (Component: typeof EditableText) => ({
  onOk,
  value,
  fieldId,
  format,
  multiline,
}: WithButtonsProps) => {
  const [editOpen, setEditOpen] = useState(false);
  const [editText, setEditText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const field = useRef<HTMLTextAreaElement | null>(null);

  const handleTextChange = (event: FormEvent<HTMLTextAreaElement>) => {
    setEditText(event.currentTarget.value);
  };

  const handleConfirm = () => {
    if (field.current?.checkValidity()) {
      setIsLoading(true);
      onOk(editText, fieldId).then((returnedError) => {
        if (returnedError) setErrorMessage(returnedError);
        else setEditOpen(false);
        setIsLoading(false);
      });
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
        if (multiline && !event.shiftKey) return;
        event.preventDefault();
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
    <div className={classes(css.withButtonsContainer)}>
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
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        error={{ message: errorMessage, setMessage: setErrorMessage }}
        isLoading={isLoading}
        value={value}
        format={format}
        required
        innerRef={(e) => {
          field.current = e;
          e.focus();
        }}
      />
    </div>
  );
};

export const EditableText: FC<
  {
    editOpen: boolean;
    editText: string;
    value: string;
    isLoading: boolean;
    format: string | undefined;
  } & ComponentPropsWithoutRef<typeof TextAreaAutosize>
> = ({ editOpen, editText, value, isLoading, format, ...props }) => {
  if (!editOpen)
    return <div className={classes(css.value, css[format ?? ''])}>{value}</div>;
  if (isLoading) return <LoadingSpinner />;
  return (
    <TextAreaAutosize
      {...props}
      className={classes(css.input, css[format ?? ''])}
      value={editText}
      autoComplete="off"
    />
  );
};

export const EditableTextWithButtons = withButtons(EditableText);

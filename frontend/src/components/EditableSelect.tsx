import classNames from 'classnames';
import {
  FC,
  useState,
  ComponentPropsWithoutRef,
  Dispatch,
  SetStateAction,
  useEffect,
} from 'react';
import Select from 'react-select';
import { CloseButton, ConfirmButton, EditButton } from './forms/SvgButton';
import { LoadingSpinner } from './LoadingSpinner';
import { FieldError } from './forms/FormField';
import css from './EditableSelect.module.scss';

const classes = classNames.bind(css);

interface Option {
  value: number;
  label: string;
}

interface WithButtonsProps {
  onOk: (newValue: number, fieldId: string) => Promise<string | void>;
  value: Option;
  fieldId: string;
  format: string | undefined;
  options: Option[];
}

const withButtons = (Component: typeof EditableSelect) => ({
  onOk,
  value,
  fieldId,
  format,
  options,
}: WithButtonsProps) => {
  const [editOpen, setEditOpen] = useState(false);
  const [editValue, setEditValue] = useState<Option>(value);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = () => {
    setIsLoading(true);
    onOk(editValue.value, fieldId).then((returnedError) => {
      if (returnedError) setErrorMessage(returnedError);
      else setEditOpen(false);
      setIsLoading(false);
    });
  };

  const handleCancel = () => {
    setErrorMessage('');
    setEditValue(value);
    setEditOpen(false);
  };

  return (
    <div
      className={classes(css.withButtonsContainer, {
        [css.withButtonsContainerEditMode]: editOpen,
      })}
    >
      <Component
        id={fieldId}
        editOpen={editOpen}
        editValue={editValue}
        onChange={(newValue) => {
          setEditValue(newValue as Option);
          setErrorMessage('');
        }}
        error={{ message: errorMessage, setMessage: setErrorMessage }}
        isLoading={isLoading}
        value={value}
        format={format}
        options={options}
      />
      {editOpen ? (
        <div className={classes(css.buttonsDiv)}>
          <CloseButton onClick={handleCancel} />
          <ConfirmButton onClick={handleConfirm} />
        </div>
      ) : (
        <div className={classes(css.editButtonDiv)}>
          <EditButton
            fontSize="medium"
            onClick={() => {
              setEditValue(value);
              setEditOpen(true);
            }}
          />
        </div>
      )}
    </div>
  );
};

export const EditableSelect: FC<
  {
    editOpen: boolean;
    editValue: Option;
    value: Option;
    options: Option[];
    isLoading: boolean;
    format: string | undefined;
    error: { message: string; setMessage: Dispatch<SetStateAction<string>> };
  } & ComponentPropsWithoutRef<typeof Select>
> = ({
  editOpen,
  editValue,
  value,
  options,
  isLoading,
  format,
  error,
  ...props
}) => {
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  useEffect(() => setMenuIsOpen(editOpen && !error.message), [editOpen, error]);

  if (!editOpen)
    return (
      <div className={classes(css.value, css[format!])}>{value.label}</div>
    );
  if (isLoading) return <LoadingSpinner />;
  return (
    <div className={classes(css.selectWrapper)}>
      <Select
        {...props}
        className={classes(css.editableSelect, css['react-select'])}
        classNamePrefix="react-select"
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          indicatorsContainer: () => ({ paddingRight: '5% !important' }),
        }}
        value={editValue}
        menuPortalTarget={document.body}
        options={options}
        isSearchable={false}
        menuIsOpen={menuIsOpen}
        onMenuOpen={() => error.setMessage('')}
      />
      <FieldError msg={error.message} />
    </div>
  );
};

export const EditableSelectWithButtons = withButtons(EditableSelect);

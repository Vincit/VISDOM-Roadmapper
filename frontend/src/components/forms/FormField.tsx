import {
  ComponentType,
  FC,
  HTMLProps,
  useState,
  useRef,
  useEffect,
} from 'react';
import { TextareaAutosize } from '@mui/material';
import classNames from 'classnames';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import css from './FormField.module.scss';
import { InfoTooltip } from '../InfoTooltip';

const classes = classNames.bind(css);

interface FieldType extends HTMLElement {
  readonly validationMessage: string;
  setCustomValidity(message: string): void;
  checkValidity(): boolean;
}

export interface FieldProps<T extends FieldType> extends HTMLProps<T> {
  label?: string;
  labelHint?: string;
  error?: {
    message: string;
    setMessage: (_: string) => void;
  };
  innerRef?: (elem: T) => void;
}

export const FieldError = ({ msg }: { msg: string }) =>
  !msg ? null : (
    <p className={classes(css.fieldError)}>
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M9.7975 0.25H4.2025L0.25 4.2025V9.79375L4.2025 13.75H9.79375L13.75 9.7975V4.2025L9.7975 0.25ZM7 10.975C6.46375 10.975 6.025 10.54 6.025 10C6.025 9.46375 6.46375 9.025 7 9.025C7.53625 9.025 7.975 9.46 7.975 10C7.975 10.54 7.53625 10.975 7 10.975ZM7.75 7.75H6.25V3.25H7.75V7.75Z" />
      </svg>
      <span>{msg}</span>
    </p>
  );

export const errorState = ([message, setMessage]: [
  string,
  (_: string) => void,
]) => ({
  message,
  setMessage,
});

function field<T extends FieldType>(
  Tag: ComponentType<HTMLProps<T>>,
): FC<FieldProps<T>> {
  return ({
    error = errorState(useState('')),
    label,
    labelHint,
    innerRef,
    id,
    ...props
  }) => {
    const ref = useRef<T>(null);
    useEffect(() => {
      if (ref.current) {
        innerRef?.(ref.current);
        if (error.message) ref.current.classList.add('input-invalid');
        ref.current.setCustomValidity(error.message);
      }
    }, [ref, error.message, innerRef]);
    return (
      <div className={classes(css.fieldContainer)}>
        {label && (
          <label htmlFor={id}>
            {label}
            {labelHint && (
              <InfoTooltip title={labelHint}>
                <InfoIcon className={classes(css.tooltipIcon)} />
              </InfoTooltip>
            )}
          </label>
        )}
        <Tag
          {...props}
          ref={ref}
          id={id}
          onInvalid={(e) => {
            e.preventDefault();
            error.setMessage(e.currentTarget.validationMessage);
            if (props.onInvalid) props.onInvalid(e);
          }}
          onBlur={(e) => {
            e.currentTarget.checkValidity();
          }}
          onChange={(e) => {
            e.currentTarget.setCustomValidity('');
            if (props.onChange) props.onChange(e);
            if (
              e.currentTarget.classList.contains('input-invalid') &&
              e.currentTarget.checkValidity()
            )
              error.setMessage('');
          }}
        />
        <FieldError msg={error.message} />
      </div>
    );
  };
}

export const Input = field<HTMLInputElement>('input' as any);
export const TextArea = field<HTMLTextAreaElement>('textarea' as any);
export const TextAreaAutosize = field<HTMLTextAreaElement>(
  TextareaAutosize as any,
);

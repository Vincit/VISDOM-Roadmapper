import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Radio as MaterialRadio } from '@material-ui/core';
import classNames from 'classnames';
import css from './RadioButton.module.scss';
import colors from '../../colors.module.scss';

const classes = classNames.bind(css);

export const RadioButton: React.FC<{
  value: string;
  checked: boolean;
  label: string;
  onChange: (value: string) => void;
}> = ({ value, checked, label, onChange }) => {
  const EmeraldRadio = withStyles({
    root: {
      color: '#DADADA',
      '&$checked': {
        color: colors.emerald,
      },
    },
    checked: {},
  })((props) => <MaterialRadio color="default" checked={checked} {...props} />);

  return (
    <div
      onClick={() => onChange(value)}
      onKeyPress={() => onChange(value)}
      tabIndex={0}
      role="radio"
      aria-checked={checked}
      aria-label={label}
      className={classes(css.radioButton, {
        [css.checked]: checked,
      })}
    >
      <EmeraldRadio />
      {label}
    </div>
  );
};

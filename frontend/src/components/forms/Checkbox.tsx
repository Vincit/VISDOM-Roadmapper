import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Checkbox as MaterialCheckbox } from '@material-ui/core';
import classNames from 'classnames';
import css from './Checkbox.module.scss';
import colors from '../../colors.module.scss';

const classes = classNames.bind(css);

export const Checkbox: React.FC<{
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}> = ({ checked, label, onChange }) => {
  const EmeraldCheckBox = withStyles({
    root: {
      color: '#DADADA',
      '&$checked': {
        color: colors.emerald,
      },
    },
    checked: {},
  })((props) => (
    <MaterialCheckbox color="default" checked={checked} {...props} />
  ));

  return (
    <div
      onClick={() => onChange(!checked)}
      onKeyPress={() => onChange(!checked)}
      tabIndex={0}
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      className={classes(css.checkBoxDiv, {
        [css.checked]: checked,
      })}
    >
      <EmeraldCheckBox />
      {label}
    </div>
  );
};

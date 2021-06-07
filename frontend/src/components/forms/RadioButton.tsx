import React from 'react';
import classNames from 'classnames';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import css from './RadioButton.module.scss';

const classes = classNames.bind(css);

export const RadioButton: React.FC<{
  checked: boolean;
}> = ({ checked }) => {
  if (checked)
    return (
      <RadioButtonCheckedIcon className={classes(css.radioButtonChecked)} />
    );
  return (
    <RadioButtonUncheckedIcon className={classes(css.radioButtonUnchecked)} />
  );
};

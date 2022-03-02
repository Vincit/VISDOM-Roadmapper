import { FC } from 'react';
import withStyles from '@mui/styles/withStyles';
import { Radio as MaterialRadio } from '@mui/material';
import classNames from 'classnames';
import FormControlLabel from '@mui/material/FormControlLabel';
import css from './RadioButton.module.scss';
import colors from '../../colors.module.scss';

const classes = classNames.bind(css);

export const RadioButton: FC<{
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
  })((props) => (
    <MaterialRadio
      color="default"
      checked={checked}
      {...props}
      onClick={() => onChange(value)}
      onKeyPress={() => onChange(value)}
    />
  ));

  return (
    <FormControlLabel
      className={classes(css.radioButton, {
        [css.checked]: checked,
      })}
      label={<div className={classes(css.labelContainer)}>{label}</div>}
      checked={checked}
      labelPlacement="end"
      control={<EmeraldRadio />}
    />
  );
};

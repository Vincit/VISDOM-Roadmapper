import { FC } from 'react';
import withStyles from '@mui/styles/withStyles';
import { Checkbox as MaterialCheckbox } from '@mui/material';
import classNames from 'classnames';
import FormControlLabel from '@mui/material/FormControlLabel';
import css from './Checkbox.module.scss';
import colors from '../../colors.module.scss';

const classes = classNames.bind(css);

export const Checkbox: FC<{
  checked: boolean;
  label?: string;
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
    <MaterialCheckbox
      color="default"
      checked={checked}
      {...props}
      onClick={() => onChange(!checked)}
      onKeyPress={() => onChange(!checked)}
    />
  ));

  if (!label) return <EmeraldCheckBox />;
  return (
    <FormControlLabel
      className={classes(css.checkBoxDiv, {
        [css.checked]: checked,
      })}
      label={label}
      checked={checked}
      labelPlacement="end"
      control={<EmeraldCheckBox />}
    />
  );
};

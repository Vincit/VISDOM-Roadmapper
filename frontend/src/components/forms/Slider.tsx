import withStyles from '@mui/styles/withStyles';
import { Slider as MaterialSlider } from '@mui/material';
import colors from '../../colors.module.scss';

export const Slider = withStyles({
  root: {
    color: colors.emerald,
  },
  thumb: {
    height: 14,
    width: 14,
    backgroundColor: colors.emerald,
    marginTop: -7,
    marginLeft: -7,
  },
  valueLabel: {
    left: 'calc(-50% - 2px)',
    top: -25,
    '& *': {
      background: 'transparent',
      color: colors.emerald,
    },
  },
  rail: {
    height: 2,
    opacity: 0.8,
    backgroundColor: colors.black40,
  },
  track: {
    height: 4,
    marginTop: -1,
  },
  mark: {
    backgroundColor: colors.black40,
    height: 10,
    width: 1,
    marginTop: -4,
  },
  markActive: {
    opacity: 1,
    backgroundColor: 'currentColor',
  },
})(MaterialSlider);

import { withStyles } from '@material-ui/core/styles';
import { Slider as MaterialSlider } from '@material-ui/core';

export const Slider = withStyles({
  root: {
    color: '#0ec679',
  },
  thumb: {
    height: 14,
    width: 14,
    backgroundColor: '#0ec679',
    marginTop: -7,
    marginLeft: -7,
  },
  valueLabel: {
    left: 'calc(-50% - 2px)',
    top: -25,
    '& *': {
      background: 'transparent',
      color: '#0ec679',
    },
  },
  rail: {
    height: 2,
    opacity: 0.8,
    backgroundColor: '#C6C6C6',
  },
  track: {
    height: 4,
    marginTop: -1,
  },
  mark: {
    backgroundColor: '#C6C6C6',
    height: 10,
    width: 1,
    marginTop: -4,
  },
  markActive: {
    opacity: 1,
    backgroundColor: 'currentColor',
  },
})(MaterialSlider);

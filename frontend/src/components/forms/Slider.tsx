import { styled } from '@mui/material/styles';
import { Slider as MaterialSlider } from '@mui/material';
import colors from '../../colors.module.scss';

export const Slider = styled(MaterialSlider)(() => ({
  color: colors.emerald,

  '& .MuiSlider-thumb': {
    height: 14,
    width: 14,
    backgroundColor: colors.emerald,
  },
  '& .MuiSlider-valueLabel': {
    marginTop: 2,
    fontSize: '10px',
    background: 'transparent',
    color: colors.emerald,
  },
  '& .MuiSlider-rail': {
    height: 2,
    opacity: 0.8,
    backgroundColor: colors.black40,
  },
  '& .MuiSlider-track': {
    height: 4,
  },
  '& .MuiSlider-mark': {
    marginLeft: 1,
    backgroundColor: colors.black40,
    height: 10,
    width: 1,
  },
  '& .MuiSlider-markActive': {
    opacity: 1,
    backgroundColor: 'currentColor',
  },
}));

import CircularProgress from '@mui/material/CircularProgress';
import classNames from 'classnames';
import css from './LoadingSpinner.module.scss';

const classes = classNames.bind(css);

export const LoadingSpinner = () => (
  <div className={classes(css.loadingSpinner)}>
    <CircularProgress size={30} color="info" />
  </div>
);

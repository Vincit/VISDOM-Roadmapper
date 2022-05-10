import { FC } from 'react';
import { Trans } from 'react-i18next';
import classNames from 'classnames';
import css from './Info.module.scss';

const classes = classNames.bind(css);

export const Info: FC<{
  open: boolean;
  onChange: (open: boolean) => void;
  className?: string;
}> = ({ open, onChange, className, children }) => (
  <div className={classes(css.instructions, className)}>
    {open && children}{' '}
    <button
      className="linkButton blue"
      tabIndex={0}
      type="button"
      onClick={() => onChange(!open)}
    >
      <Trans i18nKey={open ? 'Hide info' : 'Show info'} />
    </button>
  </div>
);

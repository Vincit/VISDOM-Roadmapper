import React, { useState } from 'react';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import classNames from 'classnames';
import css from './Dropdown.module.scss';

const classes = classNames.bind(css);

export const Dropdown: React.FC<{
  title: string;
  children?: any;
  disabled?: boolean;
  empty?: boolean;
}> = ({ title, children, disabled, empty }) => {
  const [open, setOpen] = useState(false);

  const closeMenu = () => {
    setOpen(false);
    document.removeEventListener('click', closeMenu);
  };

  const showMenu = () => {
    if (!open) {
      setOpen(true);
      document.addEventListener('click', closeMenu);
    }
  };

  const shortenString = (target: string) => {
    if (target.length > 21) return `${target.slice(0, 19)}..`;
    return target;
  };

  if (empty) {
    return (
      <div className={classes(css.dropContainer)}>
        <button type="button" className={classes(css.dropButton)}>
          {shortenString(title)}
        </button>
      </div>
    );
  }

  return (
    <div className={classes(css.dropContainer)}>
      <button
        type="button"
        className={classes(css.dropButton)}
        onClick={() => showMenu()}
        disabled={disabled}
      >
        {shortenString(title)}
        <ExpandMoreIcon className={classes(css.expandIcon)} fontSize="small" />
      </button>
      {open && (
        <div className={classes(css.dropMenu)}>
          <div className={classes(css.menuCanvas)}>{children}</div>
        </div>
      )}
    </div>
  );
};

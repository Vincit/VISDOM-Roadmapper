import React, { useState } from 'react';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import classNames from 'classnames';
import css from './Dropdown.module.scss';

const classes = classNames.bind(css);

export const Dropdown: React.FC<{
  title: String;
  children: any;
}> = ({ title, children }) => {
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

  return (
    <div className={classes(css.dropContainer)}>
      <button
        type="button"
        className={classes(css.dropButton)}
        onClick={() => showMenu()}
      >
        {title} <ArrowDropDown fontSize="small" />
      </button>
      {open && (
        <div className={classes(css.dropMenu)}>
          <div className={classes(css.menuCanvas)}>{children}</div>
        </div>
      )}
    </div>
  );
};

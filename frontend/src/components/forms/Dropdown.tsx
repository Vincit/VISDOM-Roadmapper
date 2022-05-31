import React, { FC, useCallback, useEffect, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import classNames from 'classnames';

export const Dropdown: FC<{
  css: { readonly [k: string]: string };
  title?: string;
  placeholder?: string;
  disabled?: boolean;
  empty?: boolean;
  maxLength?: number;
  id?: string;
}> = ({
  css,
  title,
  placeholder = 'Not selected',
  children,
  disabled,
  empty,
  maxLength,
  id,
}) => {
  const classes = classNames.bind(css);
  const [open, setOpen] = useState(false);

  const closeMenu = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      setOpen(false);
    },
    [setOpen],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('click', closeMenu);
    } else {
      document.removeEventListener('click', closeMenu);
    }
    return () => {
      document.removeEventListener('click', closeMenu);
    };
  }, [open, closeMenu]);

  const showMenu = (e: React.MouseEvent) => {
    if (!open) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(true);
    }
  };

  const shortenString = (target: string) => {
    if (maxLength)
      if (target.length > maxLength)
        return `${target.slice(0, maxLength - 1)}..`;
    return target;
  };

  if (empty) {
    return (
      <div className={classes(css.dropdownContainer)}>
        <button
          type="button"
          className={classes(css.dropButton)}
          disabled={disabled}
          id={id}
        >
          <div className={classes(css.emptyTitle)}>
            {shortenString(title ?? placeholder)}
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className={classes(css.dropdownContainer)}>
      <button
        type="button"
        className={classes(css.dropButton)}
        onClick={showMenu}
        disabled={disabled}
        id={id}
      >
        <div className={classes(title ? css.dropTitle : css.notSelected)}>
          {shortenString(title ?? placeholder)}
        </div>
        <ExpandMoreIcon className={classes(css.expandIcon)} />
      </button>
      {open && (
        <div className={classes(css.dropMenu)}>
          <div className={classes(css.menuCanvas)}>{children}</div>
        </div>
      )}
    </div>
  );
};

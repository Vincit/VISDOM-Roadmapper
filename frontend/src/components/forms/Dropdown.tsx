import { FC, MouseEvent, useCallback, useEffect, useState } from 'react';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import classNames from 'classnames';

export const Dropdown: FC<{
  css: any;
  title?: string;
  children?: any;
  disabled?: boolean;
  empty?: boolean;
  maxLength?: number;
}> = ({
  css,
  title = 'Not selected',
  children,
  disabled,
  empty,
  maxLength,
}) => {
  const classes = classNames.bind(css);
  const [open, setOpen] = useState(false);

  const closeMenu = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

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

  const showMenu = (e: MouseEvent) => {
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
      <div className={classes(css.dropContainer)}>
        <button
          type="button"
          className={classes(css.dropButton)}
          disabled={disabled}
        >
          <div className={classes(css.emptyTitle)}>{shortenString(title)}</div>
        </button>
      </div>
    );
  }

  return (
    <div className={classes(css.dropContainer)}>
      <button
        type="button"
        className={classes(css.dropButton)}
        onClick={showMenu}
        disabled={disabled}
      >
        <div
          className={
            title === 'Not selected'
              ? classes(css.notSelected)
              : classes(css.dropTitle)
          }
        >
          {shortenString(title)}
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

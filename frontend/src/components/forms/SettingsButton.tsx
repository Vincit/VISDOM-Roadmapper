import React from 'react';
import SettingsSharpIcon from '@material-ui/icons/SettingsSharp';
import classNames from 'classnames';
import css from './SettingsButton.module.scss';

const classes = classNames.bind(css);

export const SettingsButton: React.FC<{
  onClick?: (event: React.MouseEvent<SVGElement, MouseEvent>) => void;
  href?: string;
}> = ({ onClick, href }) => {
  if (href && href.length > 0)
    return (
      <a href={href}>
        <SettingsSharpIcon
          className={classes(css.settingsIcon)}
          onClick={onClick}
        />
      </a>
    );
  return (
    <SettingsSharpIcon
      className={classes(css.settingsIcon)}
      onClick={onClick}
    />
  );
};

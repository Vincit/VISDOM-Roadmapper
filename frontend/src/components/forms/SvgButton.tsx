import { FC, MouseEvent } from 'react';
import classNames from 'classnames';
import EditIcon from '@material-ui/icons/Edit';
import SettingsSharpIcon from '@material-ui/icons/SettingsSharp';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import DeleteIcon from '@material-ui/icons/DeleteSharp';
import CloseIcon from '@material-ui/icons/Close';
import CheckIcon from '@material-ui/icons/Check';
import MoreVertSharpIcon from '@material-ui/icons/MoreVertSharp';

import colors from '../../colors.module.scss';
import css from './SvgButton.module.scss';

const classes = classNames.bind(css);

type ButtonProps = {
  onClick?: (event: MouseEvent) => void;
};

type ExtraProps = {
  iconColor?: string;
  hoverColor?: string;
  className?: string;
};

type SvgButton<T = {}> = FC<T & ButtonProps & { href?: string }>;

function svgButton<E = {}>(
  Icon: FC<ButtonProps>,
  {
    iconColor,
    hoverColor,
    className,
    ...defaults
  }: ExtraProps & { [K in keyof E]?: E[K] },
): SvgButton<Pick<E, Exclude<keyof E, keyof ExtraProps>>> {
  return ({ href, ...props }) => {
    const icon = (
      <Icon
        className={classes(css.svgButtonIcon, className)}
        style={{ '--icon--color': iconColor, '--icon-hover-color': hoverColor }}
        {...defaults}
        {...props}
      />
    );
    return href ? <a href={href}>{icon}</a> : icon;
  };
}

export const EditButton = svgButton<{ fontSize: 'small' | 'medium' }>(
  EditIcon,
  {
    hoverColor: colors.azure,
  },
);
export const SettingsButton = svgButton(SettingsSharpIcon, {});
export const MoreButton = svgButton(MoreVertSharpIcon, {
  iconColor: colors.black60,
  hoverColor: colors.black100,
});
export const InfoButton = svgButton(InfoIcon, { hoverColor: colors.azure });
export const DeleteButton = svgButton(DeleteIcon, {
  hoverColor: colors.raspberry,
});
export const ModalCloseButton = svgButton(CloseIcon, {
  className: classes(css.closeButton),
});
export const CloseButton = svgButton(CloseIcon, {});
export const ConfirmButton = svgButton(CheckIcon, {});

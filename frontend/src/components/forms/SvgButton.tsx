import { FC, MouseEvent } from 'react';
import classNames from 'classnames';
import EditIcon from '@mui/icons-material/Edit';
import SettingsSharpIcon from '@mui/icons-material/SettingsSharp';
import MailIcon from '@mui/icons-material/MailOutlined';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import DeleteIcon from '@mui/icons-material/DeleteSharp';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import MoreVertSharpIcon from '@mui/icons-material/MoreVertSharp';

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
  hoverColor: colors.mandy,
});
export const ModalCloseButton = svgButton(CloseIcon, {
  className: classes(css.closeButton),
});
export const CloseButton = svgButton(CloseIcon, {
  hoverColor: colors.mandy,
});
export const ConfirmButton = svgButton(CheckIcon, {
  hoverColor: colors.emerald,
});
export const MailButton = svgButton(MailIcon, { hoverColor: colors.azure });

export const ExitButton = svgButton(CancelIcon, {
  hoverColor: colors.mandy,
});

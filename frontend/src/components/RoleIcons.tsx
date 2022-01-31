import { FC } from 'react';
import classNames from 'classnames';
import BuildIcon from '@material-ui/icons/BuildSharp';
import StarIcon from '@material-ui/icons/StarSharp';
import { ReactComponent as BusinessValueFilled } from '../icons/rate_value_filled.svg';
import { ReactComponent as RequiredWorkFilled } from '../icons/rate_work_filled.svg';
import { RoleType } from '../../../shared/types/customTypes';
import css from './RoleIcons.module.scss';

const classes = classNames.bind(css);

interface IconProps {
  size?: 'xxsmall' | 'xsmall' | 'small' | 'default' | 'large';
  color?: string;
}

const svgIcon = (Icon: FC): FC<IconProps> => ({ size, color }) => (
  <div
    className={classes(css.icon, css[size || 'default'])}
    style={{ ['--icon--color' as any]: color }}
  >
    <Icon />
  </div>
);

export const BusinessIcon = svgIcon(BusinessValueFilled);
export const WorkRoundIcon = svgIcon(RequiredWorkFilled);

export const RoleIcon: FC<{ type: RoleType; color?: string; small?: true }> = ({
  type,
  color,
  small,
}) => (
  <div
    className={classes(css.roleIcon)}
    style={{ ['--icon--color' as any]: color }}
  >
    {type === RoleType.Admin && (
      <StarIcon fontSize={small ? 'small' : 'default'} />
    )}
    {type === RoleType.Developer && (
      <BuildIcon fontSize={small ? 'small' : 'default'} />
    )}
    {type === RoleType.Business && (
      <BusinessIcon size={small ? 'xsmall' : 'default'} />
    )}
  </div>
);

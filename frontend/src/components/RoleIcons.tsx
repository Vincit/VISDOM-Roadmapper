import { FC } from 'react';
import classNames from 'classnames';
import { ReactComponent as BusinessValueFilled } from '../icons/rate_value_filled.svg';
import { ReactComponent as RequiredWorkFilled } from '../icons/rate_work_filled.svg';
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

import { FC, forwardRef } from 'react';
import classNames from 'classnames';
import { Trans } from 'react-i18next';
import BuildIcon from '@material-ui/icons/BuildSharp';
import StarIcon from '@material-ui/icons/StarSharp';
import { ReactComponent as BusinessValueFilled } from '../icons/rate_value_filled.svg';
import { ReactComponent as RequiredWorkFilled } from '../icons/rate_work_filled.svg';
import { RoleType } from '../../../shared/types/customTypes';
import css from './RoleIcons.module.scss';
import { InfoTooltip } from './InfoTooltip';

const classes = classNames.bind(css);

interface IconProps {
  size?: 'xxsmall' | 'xsmall' | 'small' | 'medium' | 'large';
  color?: string;
}

const svgIcon = (Icon: FC): FC<IconProps> => ({ size, color }) => (
  <div
    className={classes(css.icon, css[size || 'medium'])}
    style={{ ['--icon--color' as any]: color }}
  >
    <Icon />
  </div>
);

export const BusinessIcon = svgIcon(BusinessValueFilled);
export const WorkRoundIcon = svgIcon(RequiredWorkFilled);

export const RoleIcon: FC<{
  type: RoleType;
  color?: string;
  small?: true;
  tooltip?: true;
}> = ({ type, color, small, tooltip }) => {
  // ref & props are attached to parent div to avoid breaking styles
  const Icon = forwardRef<HTMLDivElement>((props, ref) => (
    <div ref={ref} {...props}>
      <div
        className={classes(css.roleIcon)}
        style={{ ['--icon--color' as any]: color }}
      >
        {type === RoleType.Admin && (
          <StarIcon fontSize={small ? 'small' : 'medium'} />
        )}
        {type === RoleType.Developer && (
          <BuildIcon fontSize={small ? 'small' : 'medium'} />
        )}
        {type === RoleType.Business && (
          <BusinessIcon size={small ? 'xsmall' : 'medium'} />
        )}
      </div>
    </div>
  ));
  if (tooltip)
    return (
      <InfoTooltip title={<Trans i18nKey={RoleType[type]} />}>
        <Icon />
      </InfoTooltip>
    );
  return <Icon />;
};

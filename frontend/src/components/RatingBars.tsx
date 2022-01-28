import { FC, useState } from 'react';
import classNames from 'classnames';
import { Rating as MaterialRating } from '@material-ui/lab';
import { TaskRatingDimension } from '../../../shared/types/customTypes';
import { BusinessIcon, WorkRoundIcon } from './RoleIcons';
import css from './RatingBars.module.scss';

const classes = classNames.bind(css);

type RatingBarProps = {
  onChange?: (value: number) => void;
  dimension: TaskRatingDimension;
  initialValue: number;
} & ({ readonly: true } | { name: string });

export const TaskRatingBar: FC<RatingBarProps> = ({
  dimension,
  onChange,
  initialValue,
  ...rest
}) => {
  const [hover, setHover] = useState(0);
  const readonly = 'readonly' in rest;

  return (
    <div className={classes(css.ratingBar)}>
      <MaterialRating
        name={'name' in rest ? rest.name : undefined}
        readOnly={readonly}
        value={initialValue}
        max={5}
        onChange={(_, value) => {
          if (onChange && value) onChange(value);
        }}
        onChangeActive={(_, value) => setHover(value)}
        icon={
          dimension === TaskRatingDimension.BusinessValue ? (
            <BusinessIcon />
          ) : (
            <WorkRoundIcon />
          )
        }
        classes={{
          icon: classes(css.icon),
          iconFilled: classes(css.iconFilled),
          iconEmpty: classes(css.iconEmpty),
          iconActive: classes(css.iconActive),
        }}
      />
      {!readonly && (
        <div className={classes(css.rating)}>
          {hover > 0
            ? hover
            : initialValue || <div className={classes(css.unrated)}>-</div>}
        </div>
      )}
    </div>
  );
};

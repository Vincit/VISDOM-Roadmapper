import { FC, useState } from 'react';
import classNames from 'classnames';
import { Rating as MaterialRating } from '@material-ui/lab';
import { TaskRatingDimension } from '../../../shared/types/customTypes';
import { RequiredWorkEmpty, BusinessValueEmpty } from './RatingIcons';
import css from './RatingBars.module.scss';

const classes = classNames.bind(css);

interface RatingBarProps {
  onChange?: (value: number) => void;
  dimension: TaskRatingDimension;
  initialValue: number;
  readonly?: boolean;
}

export const TaskRatingBar: FC<RatingBarProps> = ({
  dimension,
  onChange,
  initialValue,
  readonly,
}) => {
  const [hover, setHover] = useState(0);

  return (
    <div className={classes(css.ratingBar)}>
      <MaterialRating
        readOnly={readonly}
        value={initialValue}
        max={10}
        onChange={(e, value) => {
          if (onChange && value) onChange(value);
        }}
        onChangeActive={(e, value) => setHover(value)}
        icon={
          dimension === TaskRatingDimension.BusinessValue ? (
            <BusinessValueEmpty />
          ) : (
            <RequiredWorkEmpty />
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

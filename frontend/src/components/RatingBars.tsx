import { FC, useState } from 'react';
import classNames from 'classnames';
import { Rating as MaterialRating } from '@mui/material';
import { Trans } from 'react-i18next';
import { TaskRatingDimension } from '../../../shared/types/customTypes';
import { BusinessIcon, WorkRoundIcon } from './RoleIcons';
import css from './RatingBars.module.scss';
import { revertScale, convertScale } from '../../../shared/utils/conversion';

const classes = classNames.bind(css);

const labels: { [K in TaskRatingDimension]: { [index: string]: string } } = {
  [TaskRatingDimension.BusinessValue]: {
    1: 'Not Relevant',
    2: 'A Bit Important',
    3: 'Somewhat Important',
    4: 'Important',
    5: 'Business Critical',
  },
  [TaskRatingDimension.Complexity]: {
    1: 'Trivial',
    2: 'Simple',
    3: 'Moderate',
    4: 'Complex',
    5: 'Extremely Complex',
  },
};

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

  const getIcon = () => {
    return dimension === TaskRatingDimension.BusinessValue ? (
      <BusinessIcon />
    ) : (
      <WorkRoundIcon />
    );
  };

  return (
    <div className={classes(css.ratingBar)}>
      <MaterialRating
        name={'name' in rest ? rest.name : undefined}
        readOnly={readonly}
        value={revertScale(initialValue)}
        max={5}
        onChange={(_, value) => {
          if (!onChange) return;
          if (value) onChange(convertScale(value));
          else {
            onChange(0);
            setHover(0);
          }
        }}
        onChangeActive={(_, value) => setHover(value)}
        icon={getIcon()}
        emptyIcon={getIcon()}
        classes={{
          icon: classes(css.icon),
          iconFilled: classes(css.iconFilled),
          iconEmpty: classes(css.iconEmpty),
          iconActive: classes(css.iconActive),
        }}
      />
      {!readonly && (
        <div className={classes(css.rating)}>
          {hover > 0 ? (
            <>
              {convertScale(hover)}
              {' - '}
              <Trans i18nKey={labels[dimension][hover]} />
            </>
          ) : (
            initialValue || <div className={classes(css.unrated)}>-</div>
          )}
        </div>
      )}
    </div>
  );
};

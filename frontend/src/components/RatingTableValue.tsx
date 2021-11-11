import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { userSelector, customerSelector } from '../redux/roadmaps/selectors';
import { ratingTable, RatingRow } from './RatingTable';
import { Dot } from './Dot';
import { TaskRatingDimension } from '../../../shared/types/customTypes';
import css from './RatingTable.module.scss';

const classes = classNames.bind(css);

const numFormat = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const TableValueRatingRow: RatingRow = ({ rating, style }) => {
  const user = useSelector(userSelector(rating.createdByUser));
  const customer = useSelector(customerSelector(rating.forCustomer));
  if (!user || !customer) return null;

  return (
    <div style={style} className={classes(css.ratingRow)}>
      <div className={classes(css.valueRating)}>
        <div className={classes(css.rightSide)}>
          <div className={classes(css.topRow)}>
            <Dot fill={customer.color} />
            <div className={classes(css.name)}>{customer.name}</div>
          </div>
          <div className={classes(css.bottomRow, css.name)}>{user.email}</div>
        </div>
        <div className={classes(css.value)}>
          {numFormat.format(rating.value)}
        </div>
      </div>
      {rating.comment.length > 0 && (
        <div className={classes(css.comment)}>{rating.comment}</div>
      )}
    </div>
  );
};

export const RatingTableValue = ratingTable({
  type: TaskRatingDimension.BusinessValue,
  Row: TableValueRatingRow,
});

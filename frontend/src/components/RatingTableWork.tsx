import classNames from 'classnames';
import BuildSharpIcon from '@material-ui/icons/BuildSharp';
import { useSelector } from 'react-redux';
import { userSelector } from '../redux/roadmaps/selectors';
import { ratingTable, RatingRow } from './RatingTable';
import { TaskRatingDimension } from '../../../shared/types/customTypes';
import css from './RatingTable.module.scss';

const classes = classNames.bind(css);

const numFormat = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const TableWorkRatingRow: RatingRow = ({ rating, style }) => {
  const user = useSelector(userSelector(rating.createdByUser))!;

  return (
    <div style={style} className={classes(css.ratingRow)}>
      <div className={classes(css.topRow)}>
        <BuildSharpIcon fontSize="small" />
        <div className={classes(css.name)}>{user.email}</div>
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

export const RatingTableWork = ratingTable({
  type: TaskRatingDimension.RequiredWork,
  Row: TableWorkRatingRow,
});

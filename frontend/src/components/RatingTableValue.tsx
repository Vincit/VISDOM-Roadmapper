import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { ratingTable, RatingRow } from './RatingTable';
import { EditButton } from './forms/SvgButton';
import { Dot } from './Dot';
import { TaskRatingDimension } from '../../../shared/types/customTypes';
import css from './RatingTable.module.scss';
import { apiV2, selectById } from '../api/api';

const classes = classNames.bind(css);

const numFormat = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const TableValueRatingRow: RatingRow = ({ rating, style, userId, onEdit }) => {
  const roadmapId = useSelector(chosenRoadmapIdSelector);
  const { data: user } = apiV2.useGetRoadmapUsersQuery(
    roadmapId ?? skipToken,
    selectById(rating.createdByUser),
  );
  const { data: customer } = apiV2.useGetCustomersQuery(
    roadmapId ?? skipToken,
    selectById(rating.forCustomer),
  );

  if (!user || !customer) return null;

  return (
    <div style={style} className={classes(css.ratingRow)}>
      <div className={classes(css.valueRating)}>
        <div className={classes(css.leftSide)}>
          <div className={classes(css.topRow)}>
            <Dot fill={customer.color} />
            <div className={classes(css.name)}>{customer.name}</div>
          </div>
          <div className={classes(css.bottomRow, css.name)}>{user.email}</div>
        </div>
        <div className={classes(css.rightSide)}>
          {user.id === userId && (
            <EditButton fontSize="medium" onClick={onEdit} />
          )}
          <div className={classes(css.value)}>
            {numFormat.format(rating.value)}
          </div>
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

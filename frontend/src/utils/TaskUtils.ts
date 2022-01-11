import {
  Customer,
  Roadmap,
  RoadmapUser,
  Task,
  Taskrating,
} from '../redux/roadmaps/types';
import { isCustomer } from './CustomerUtils';
import { UserInfo } from '../redux/user/types';
import {
  RoleType,
  TaskRatingDimension,
} from '../../../shared/types/customTypes';
import { SortBy, sortKeyNumeric, sortKeyLocale } from './SortUtils';
import { getType, isUserInfo } from './UserUtils';
import { partition } from './array';

export enum FilterTypes {
  SHOW_ALL,
  NOT_RATED_BY_ME,
  RATED_BY_ME,
  COMPLETED,
  NOT_COMPLETED,
}

export enum SortingTypes {
  SORT_NAME,
  SORT_STATUS,
  SORT_DESC,
  SORT_CREATEDAT,
  SORT_RATINGS,
  SORT_AVG_VALUE,
  SORT_AVG_WORK,
  SORT_TOTAL_VALUE,
  SORT_TOTAL_WORK,
}

class RatingsSummary {
  private sum: number = 0;

  private count: number = 0;

  get total() {
    return this.sum;
  }

  get avg() {
    return this.count ? this.sum / this.count : 0;
  }

  add(rating: number) {
    this.sum += rating;
    this.count += 1;
    return this;
  }
}

// Accumulates results into provided map
const ratingsSummaryByDimensionInto = (
  result: Map<TaskRatingDimension, RatingsSummary>,
  task: Task,
) =>
  task.ratings.reduce((acc, { value, dimension }) => {
    const previous = acc.get(dimension) ?? new RatingsSummary();
    return acc.set(dimension, previous.add(value));
  }, result);

export const ratingsSummaryByDimension = (task: Task) =>
  ratingsSummaryByDimensionInto(new Map(), task);

export const valueAndWorkSummary = (task: Task) => {
  const ratings = ratingsSummaryByDimension(task);
  return {
    value:
      ratings.get(TaskRatingDimension.BusinessValue) ?? new RatingsSummary(),
    work: ratings.get(TaskRatingDimension.RequiredWork) ?? new RatingsSummary(),
  };
};

export const totalValueAndWork = (tasks: Task[]) =>
  tasks
    .map((task) => valueAndWorkSummary(task))
    .reduce(
      ({ value, work }, ratings) => ({
        value: value + ratings.value.avg,
        work: work + ratings.work.avg,
      }),
      { value: 0, work: 0 },
    );

export const averageValueAndWork = (tasks: Task[]) => {
  const ratings = tasks.reduce(ratingsSummaryByDimensionInto, new Map());
  return {
    value: ratings.get(TaskRatingDimension.BusinessValue)?.avg ?? 0,
    work: ratings.get(TaskRatingDimension.RequiredWork)?.avg ?? 0,
  };
};

const calcTaskPriority = (task: Task) => {
  const ratings = ratingsSummaryByDimension(task);
  const value = ratings.get(TaskRatingDimension.BusinessValue);
  const work = ratings.get(TaskRatingDimension.RequiredWork);
  if (!value) return -2;
  if (!work) return -1;
  return value.avg / work.avg;
};

type Predicate<T> = (t: T) => boolean;
const not = <T>(f: Predicate<T>) => (t: T) => !f(t);
const or = <T>(...fs: Predicate<T>[]) => (t: T) =>
  fs.reduce((res, f) => res || f(t), false);

export const ratedByUser = (user: RoadmapUser | UserInfo) => (task: Task) =>
  task.ratings.some((rating) => rating.createdByUser === user.id);

const hasUserRating = (task: Task) => {
  const ids = task.ratings.map((rating) => rating.createdByUser);
  return (user: RoadmapUser | UserInfo) => ids.includes(user.id);
};

export const ratedByCustomer = (
  customer: Customer,
  rep: RoadmapUser | UserInfo,
) => (task: Task) =>
  task.ratings.some(
    (rating) =>
      rating.forCustomer === customer.id && rating.createdByUser === rep.id,
  );

const completed = (task: Task) => task.completed;

export const taskFilter = (
  type: FilterTypes | undefined,
  user?: UserInfo,
): ((task: Task) => boolean) | undefined => {
  switch (type) {
    case FilterTypes.NOT_RATED_BY_ME:
      return user && not(ratedByUser(user));
    case FilterTypes.RATED_BY_ME:
      return user && ratedByUser(user);
    case FilterTypes.COMPLETED:
      return completed;
    case FilterTypes.NOT_COMPLETED:
      return not(completed);
    default:
      break;
  }
};

export const taskSort = (type: SortingTypes | undefined): SortBy<Task> => {
  switch (type) {
    case SortingTypes.SORT_CREATEDAT:
      return sortKeyNumeric((t) => new Date(t.createdAt).getTime());
    case SortingTypes.SORT_NAME:
      return sortKeyLocale('name');
    case SortingTypes.SORT_DESC:
      return sortKeyLocale('description');
    case SortingTypes.SORT_STATUS:
      return sortKeyNumeric((t) => +t.completed);
    case SortingTypes.SORT_RATINGS:
      return sortKeyNumeric(calcTaskPriority);
    case SortingTypes.SORT_AVG_VALUE:
      return sortKeyNumeric((t) => valueAndWorkSummary(t).value.avg);
    case SortingTypes.SORT_AVG_WORK:
      return sortKeyNumeric((t) => valueAndWorkSummary(t).work.avg);
    case SortingTypes.SORT_TOTAL_VALUE:
      return sortKeyNumeric((t) => valueAndWorkSummary(t).value.total);
    case SortingTypes.SORT_TOTAL_WORK:
      return sortKeyNumeric((t) => valueAndWorkSummary(t).work.total);
    default:
      break;
  }
};

const ratingValueAndCreator = (roadmap: Roadmap) => (rating: Taskrating) => {
  const ratingCreator = roadmap.customers?.find(
    ({ id }) => id === rating.forCustomer,
  );
  const creatorWeight = ratingCreator?.weight ?? 0;
  return {
    value: rating.value * creatorWeight,
    customer: ratingCreator,
  };
};

const taskRatingsCustomerStakes = (roadmap: Roadmap) => (
  result: Map<Customer, number>,
  task: Task,
) =>
  task.ratings
    .filter(({ dimension }) => dimension === TaskRatingDimension.BusinessValue)
    .map(ratingValueAndCreator(roadmap))
    .reduce((acc, rating) => {
      if (!rating.customer) return acc;
      const previousVal = acc.get(rating.customer) || 0;
      return acc.set(rating.customer, previousVal + rating.value);
    }, result);

// Calculate total sum of task values in the milestone
// And map values of how much each user has rated in these tasks
export const totalCustomerStakes = (tasks: Task[], roadmap: Roadmap) =>
  tasks.reduce(taskRatingsCustomerStakes(roadmap), new Map());

const taskWeightedValueSummary = (task: Task, roadmap: Roadmap) =>
  task.ratings
    .filter(({ dimension }) => dimension === TaskRatingDimension.BusinessValue)
    .map(ratingValueAndCreator(roadmap))
    .reduce((acc, rating) => acc.add(rating.value), new RatingsSummary());

export const totalWeightedValueAndWork = (tasks: Task[], roadmap: Roadmap) => {
  const { work } = totalValueAndWork(tasks);
  const totalValues = tasks
    .map((task) => taskWeightedValueSummary(task, roadmap))
    .reduce(
      (acc, summary) => ({
        sum: acc.sum + summary.avg,
        total: acc.total + summary.total,
      }),
      { sum: 0, total: 0 },
    );
  return { value: totalValues.sum, totalValue: totalValues.total, work };
};

export const weightedTaskPriority = (roadmap: Roadmap) => (task: Task) => {
  const weightedValue = taskWeightedValueSummary(task, roadmap).avg;
  if (!weightedValue) return -2;

  const avgWorkRating = valueAndWorkSummary(task).work.avg;

  if (!avgWorkRating) return -1;

  return weightedValue / avgWorkRating;
};

export const awaitsUserRatings = <T extends UserInfo | RoadmapUser>(
  user: T,
  roadmap: T extends UserInfo ? number | Roadmap : Roadmap,
) => {
  const roadmapId = typeof roadmap === 'number' ? roadmap : roadmap.id;
  const userType = getType(user, roadmapId);

  // Admins and business users represent customers. Separate logic for determining need for ratings.
  if (userType === RoleType.Admin || userType === RoleType.Business) {
    const customers = isUserInfo(user)
      ? user.representativeFor?.filter(
          (customer) => customer.roadmapId === roadmapId,
        )
      : (roadmap as Roadmap).customers?.filter((customer) =>
          customer.representatives?.some((rep) => rep.id === user.id),
        );

    // If user represents no customers, always return false
    if (!customers || customers.length === 0) return () => false;

    // Otherwise filter for tasks that lack ratings from at least one represented customer
    return (task: Task) =>
      task.roadmapId === roadmapId &&
      !customers.every((customer) => ratedByCustomer(customer, user)(task));
  }

  // For other user types just look for missing ratings by them
  return not(ratedByUser(user));
};

export const hasMissingRatings = ({ users = [], customers = [] }: Roadmap) => {
  const devs = users.filter((user) => user.type === RoleType.Developer);
  const reps = customers.map((customer) => customer.representatives ?? []);
  const shouldHaveRated = devs.concat(...reps);
  return (task: Task) => !shouldHaveRated.every(hasUserRating(task));
};

export const hasRatingsOnEachDimension = (task: Task) =>
  [
    TaskRatingDimension.BusinessValue,
    TaskRatingDimension.RequiredWork,
  ].every((dim) => task.ratings.some((rating) => rating.dimension === dim));

/*
  For Customers consider missing representative ratings
  For Admin and Business -users consider missing represented ratings
  For Admin also consider missing ratings from others
  For others consider their own missing ratings
*/
export const isUnrated = (
  user: RoadmapUser | Customer | UserInfo,
  roadmap: Roadmap,
): ((task: Task) => boolean) => {
  if (isCustomer(user))
    return (task) =>
      !!user.representatives?.some((rep) => !ratedByCustomer(user, rep)(task));

  const baseCondition = awaitsUserRatings(user, roadmap);
  if (getType(user, roadmap.id) === RoleType.Admin)
    return or(baseCondition, hasMissingRatings(roadmap));
  return baseCondition;
};

export const unratedTasksAmount = (
  user: RoadmapUser | Customer | UserInfo,
  roadmap: Roadmap,
) => roadmap.tasks.filter(isUnrated(user, roadmap)).length;

export const missingDeveloper = (task: Task) => {
  const ratedBy = hasUserRating(task);
  return (user: RoadmapUser) =>
    user.type === RoleType.Developer && !ratedBy(user);
};

export const missingCustomer = (task: Task) => (customer: Customer) =>
  !customer.representatives?.every((rep) =>
    ratedByCustomer(customer, rep)(task),
  );

export const getRatingsByType = (ratings: Taskrating[]) => {
  const [value, work] = partition(
    ratings,
    ({ dimension }) => dimension === TaskRatingDimension.BusinessValue,
  );
  return { value, work };
};

export const findTask = (taskId: number, roadmaps: Roadmap[]) =>
  roadmaps.reduce<Task | undefined>(
    (found, roadmap) =>
      found ?? roadmap.tasks.find((task) => task.id === taskId),
    undefined,
  );

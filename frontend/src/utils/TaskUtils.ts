import { DraggableLocation } from 'react-beautiful-dnd';
import {
  Customer,
  Roadmap,
  RoadmapUser,
  Task,
  Taskrating,
} from '../redux/roadmaps/types';
import { customerWeight, isCustomer } from './CustomerUtils';
import { UserInfo } from '../redux/user/types';
import {
  RoleType,
  TaskRatingDimension,
} from '../../../shared/types/customTypes';
import { Sort, sortKeyNumeric, sortKeyLocale } from './SortUtils';
import { getType, isUserInfo } from './UserUtils';

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

const not = <T>(f: (t: T) => boolean) => (t: T) => !f(t);

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

export const taskSort = (type: SortingTypes | undefined): Sort<Task> => {
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

// Function to help with reordering item in list
export const reorderList = (
  list: Task[],
  startIndex: number,
  endIndex: number,
) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

// Function to help move items between lists
export const dragDropBetweenLists = (
  source: Task[],
  destination: Task[],
  droppableSource: DraggableLocation,
  droppableDestination: DraggableLocation,
) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  return {
    [droppableSource.droppableId]: sourceClone,
    [droppableDestination.droppableId]: destClone,
  };
};

const ratingValueAndCreator = (roadmap: Roadmap, notWeighted?: boolean) => (
  rating: Taskrating,
) => {
  const ratingCreator = roadmap.customers?.find(
    ({ id }) => id === rating.forCustomer,
  );
  const creatorWeight = ratingCreator
    ? customerWeight(ratingCreator, roadmap.plannerCustomerWeights)
    : 0;

  return {
    value: notWeighted ? rating.value : rating.value * creatorWeight,
    customer: ratingCreator,
  };
};

const taskRatingsCustomerStakes = (roadmap: Roadmap, notWeighted?: boolean) => (
  result: Map<Customer, number>,
  task: Task,
) =>
  task.ratings
    .filter(({ dimension }) => dimension === TaskRatingDimension.BusinessValue)
    .map(ratingValueAndCreator(roadmap, notWeighted))
    .reduce((acc, rating) => {
      if (!rating.customer) return acc;
      const previousVal = acc.get(rating.customer) || 0;
      return acc.set(rating.customer, previousVal + rating.value);
    }, result);

// Calculate total sum of task values in the milestone
// And map values of how much each user has rated in these tasks
export const totalCustomerStakes = (
  tasks: Task[],
  roadmap: Roadmap,
  notWeighted?: boolean,
) => tasks.reduce(taskRatingsCustomerStakes(roadmap, notWeighted), new Map());

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

export const calcWeightedTaskPriority = (task: Task, roadmap: Roadmap) => {
  const weightedValue = taskWeightedValueSummary(task, roadmap).avg;
  if (!weightedValue) return -2;

  const avgWorkRating = valueAndWorkSummary(task).work.avg;

  if (!avgWorkRating) return -1;

  return weightedValue / avgWorkRating;
};

export const awaitsUserRatings = (
  user: UserInfo,
  roadmap: number | Roadmap,
) => {
  const roadmapId = typeof roadmap === 'number' ? roadmap : roadmap.id;
  const type = getType(user.roles, roadmapId);
  if (type === RoleType.Admin || type === RoleType.Business) {
    const reps = user.representativeFor?.filter(
      (customer) => customer.roadmapId === roadmapId,
    );
    return (task: Task) =>
      task.roadmapId === roadmapId &&
      !reps?.every((customer) => ratedByCustomer(customer, user)(task));
  }
  return not(ratedByUser(user));
};

const isUnratedProductOwnerTask = ({ users = [], customers = [] }: Roadmap) => {
  const devs = users.filter((user) => user.type === RoleType.Developer);
  const reps = customers.map((customer) => customer.representatives ?? []);
  const shouldHaveRated = devs.concat(...reps);
  return (task: Task) => !shouldHaveRated.every(hasUserRating(task));
};

/*
  For Customers consider missing representative ratings
  For Admin and Business -users consider missing represented ratings
  For others consider their own missing ratings
*/
export const isUnrated = (
  user: RoadmapUser | Customer | UserInfo,
  roadmap: Roadmap,
): ((task: Task) => boolean) => {
  if (isCustomer(user))
    return (task) =>
      !!user.representatives?.some((rep) => !ratedByCustomer(user, rep)(task));

  if (isUserInfo(user)) {
    return getType(user.roles, roadmap.id) === RoleType.Admin
      ? isUnratedProductOwnerTask(roadmap)
      : awaitsUserRatings(user, roadmap);
  }

  if (user.type === RoleType.Admin || user.type === RoleType.Business) {
    const represented = roadmap.customers?.filter((customer) =>
      customer.representatives?.some((rep) => rep.id === user.id),
    );
    return (task) =>
      !!represented?.some((customer) => !ratedByCustomer(customer, user)(task));
  }
  return not(ratedByUser(user));
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

import {
  Customer,
  RoadmapUser,
  Task,
  Taskrating,
  Version,
} from '../redux/roadmaps/types';
import { isCustomer } from './CustomerUtils';
import { UserInfo } from '../redux/user/types';
import {
  RoleType,
  TaskRatingDimension,
  TaskStatus,
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
  SORT_TOTAL_VALUE,
  SORT_COMPLEXITY,
}

class Summary {
  private sum: number = 0;

  private count: number = 0;

  get total() {
    return this.sum;
  }

  get avg() {
    return this.count ? this.sum / this.count : 0;
  }

  add(value: number) {
    this.sum += value;
    this.count += 1;
    return this;
  }
}

export const taskStatusToText = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.NOT_STARTED:
      return 'Not started';
    case TaskStatus.IN_PROGRESS:
      return 'In progress';
    case TaskStatus.COMPLETED:
      return 'Completed';
    default:
      throw new Error(
        `taskStatusToText received an invalid taskStatus (status: ${status})`,
      );
  }
};

// Accumulates results into provided map
const ratingsSummaryByDimensionInto = (
  result: Map<TaskRatingDimension, Summary>,
  task: Task,
) =>
  task.ratings.reduce((acc, { value, dimension }) => {
    const previous = acc.get(dimension) ?? new Summary();
    return acc.set(dimension, previous.add(value));
  }, result);

export const ratingsSummaryByDimension = (task: Task) =>
  ratingsSummaryByDimensionInto(new Map(), task);

export const valueAndComplexitySummary = (task: Task) => {
  const ratings = ratingsSummaryByDimension(task);
  return {
    value: ratings.get(TaskRatingDimension.BusinessValue) ?? new Summary(),
    complexity: ratings.get(TaskRatingDimension.Complexity)?.avg ?? 0,
  };
};

export const totalValueAndComplexity = (tasks: Task[]) =>
  tasks
    .map((task) => valueAndComplexitySummary(task))
    .reduce(
      ({ value, complexity }, ratings) => ({
        value: value + ratings.value.avg,
        complexity: complexity + ratings.complexity,
      }),
      { value: 0, complexity: 0 },
    );

export const isCompletedTask = (task: Task) =>
  task.status === TaskStatus.COMPLETED;

export const remainingTotalValueAndComplexity = (tasks: Task[]) =>
  totalValueAndComplexity(tasks.filter((task) => !isCompletedTask(task)));

export const averageValueAndComplexity = (tasks: Task[]) => {
  const ratings = tasks.reduce(ratingsSummaryByDimensionInto, new Map());
  return {
    value: ratings.get(TaskRatingDimension.BusinessValue)?.avg ?? 0,
    complexity: ratings.get(TaskRatingDimension.Complexity)?.avg ?? 0,
  };
};

const calcTaskPriority = (task: Task) => {
  const ratings = ratingsSummaryByDimension(task);
  const value = ratings.get(TaskRatingDimension.BusinessValue);
  const complexity = ratings.get(TaskRatingDimension.Complexity);
  if (!value) return -2;
  if (!complexity) return -1;
  return value.avg / complexity.avg;
};

type Predicate<T> = (t: T) => boolean;
const not = <T>(f: Predicate<T>) => (t: T) => !f(t);
const or = <T>(...fs: Predicate<T>[]) => (t: T) =>
  fs.reduce((res, f) => res || f(t), false);
const and = <T>(...fs: Predicate<T>[]) => (t: T) =>
  fs.reduce((res, f) => res && f(t), true);

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

export const isCompletedMilestone = ({ tasks }: Version) =>
  tasks.length > 0 && tasks.every(isCompletedTask);

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
      return isCompletedTask;
    case FilterTypes.NOT_COMPLETED:
      return not(isCompletedTask);
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
      return sortKeyNumeric('status');
    case SortingTypes.SORT_RATINGS:
      return sortKeyNumeric(calcTaskPriority);
    case SortingTypes.SORT_AVG_VALUE:
      return sortKeyNumeric((t) => valueAndComplexitySummary(t).value.avg);
    case SortingTypes.SORT_COMPLEXITY:
      return sortKeyNumeric((t) => valueAndComplexitySummary(t).complexity);
    case SortingTypes.SORT_TOTAL_VALUE:
      return sortKeyNumeric((t) => valueAndComplexitySummary(t).value.total);
    default:
      break;
  }
};

const ratingValues = (task: Task, customers: Customer[] | undefined) =>
  task.ratings
    .filter(({ dimension }) => dimension === TaskRatingDimension.BusinessValue)
    .map(({ value, forCustomer }) => {
      const creator = customers?.find(({ id }) => id === forCustomer);
      const weight = creator?.weight ?? 0;
      return {
        weighted: value * weight,
        unweighted: value,
        creator,
      };
    });

export const taskRatingsCustomerStakes = (
  customers: Customer[] | undefined,
) => (result: Map<Customer, Summary>, task: Task) =>
  ratingValues(task, customers).reduce((acc, { creator, unweighted }) => {
    if (!creator) return acc;
    const prevSummary = acc.get(creator) || new Summary();
    return acc.set(creator, prevSummary.add(unweighted));
  }, result);

// Calculate total sum of task values in the milestone
// And map values of how much each user has rated in these tasks
export const customerStakesSummary = (
  tasks: Task[],
  customers: Customer[] | undefined,
) => tasks.reduce(taskRatingsCustomerStakes(customers), new Map());

const taskValuesSummary = (task: Task, customers: Customer[] | undefined) =>
  ratingValues(task, customers).reduce(
    (acc, { weighted, unweighted }) => ({
      weighted: acc.weighted.add(weighted),
      unweighted: acc.unweighted.add(unweighted),
    }),
    {
      weighted: new Summary(),
      unweighted: new Summary(),
    },
  );

export const totalValuesAndComplexity = (
  tasks: Task[],
  customers: Customer[] | undefined,
) => {
  const { complexity } = totalValueAndComplexity(tasks);
  const totalValues = tasks
    .map((task) => taskValuesSummary(task, customers))
    .reduce(
      (acc, summary) => ({
        weightedSum: acc.weightedSum + summary.weighted.avg,
        unweightedSum: acc.unweightedSum + summary.unweighted.avg,
        weightedTotal: acc.weightedTotal + summary.weighted.total,
        unweightedTotal: acc.unweightedTotal + summary.unweighted.total,
      }),
      {
        weightedSum: 0,
        unweightedSum: 0,
        weightedTotal: 0,
        unweightedTotal: 0,
      },
    );
  return {
    value: totalValues.weightedSum,
    totalValue: totalValues.weightedTotal,
    unweightedValue: totalValues.unweightedSum,
    unweightedTotalValue: totalValues.unweightedTotal,
    complexity,
  };
};

export const weightedTaskPriority = (customers: Customer[] | undefined) => (
  task: Task,
) => {
  const weightedValue = taskValuesSummary(task, customers).weighted.avg;
  if (!weightedValue) return -2;

  const avgComplexityRating = valueAndComplexitySummary(task).complexity;
  if (!avgComplexityRating) return -1;

  return weightedValue / avgComplexityRating;
};

export const awaitsUserRatings = <T extends UserInfo | RoadmapUser>(
  user: T,
  roadmapId: number,
  customers: Customer[] | undefined,
) => {
  const userType = getType(user, roadmapId);

  // Admins and business users represent customers. Separate logic for determining need for ratings.
  if (userType === RoleType.Admin || userType === RoleType.Business) {
    const filteredCustomers = isUserInfo(user)
      ? user.representativeFor?.filter(
          (customer) => customer.roadmapId === roadmapId,
        )
      : customers?.filter((customer) =>
          customer.representatives?.some((rep) => rep.id === user.id),
        );

    // If user represents no customers, always return false
    if (!filteredCustomers || filteredCustomers.length === 0)
      return () => false;

    // Otherwise filter for tasks that lack ratings from at least one represented customer
    return (task: Task) =>
      !isCompletedTask(task) &&
      task.roadmapId === roadmapId &&
      !filteredCustomers.every((customer) =>
        ratedByCustomer(customer, user)(task),
      );
  }

  // For other user types just look for missing ratings by them
  return not(or(isCompletedTask, ratedByUser(user)));
};

export const unratedTasksByUserCount = (
  tasks: Task[],
  user: RoadmapUser,
  roadmapId: number,
  customers: Customer[],
) => {
  return tasks?.filter(awaitsUserRatings(user, roadmapId, customers)).length;
};

const hasMissingRatings = (
  users: RoadmapUser[] = [],
  customers: Customer[] = [],
) => {
  const devs = users.filter((user) => user.type === RoleType.Developer);
  const reps = customers.map((customer) => customer.representatives ?? []);
  const shouldHaveRated = devs.concat(...reps);
  return (task: Task) => !shouldHaveRated.every(hasUserRating(task));
};

export const hasRatingsOnEachDimension = (task: Task) =>
  [
    TaskRatingDimension.BusinessValue,
    TaskRatingDimension.Complexity,
  ].every((dim) => task.ratings.some((rating) => rating.dimension === dim));

/*
  For Customers consider missing representative ratings
  For Admin and Business -users consider missing represented ratings
  For Admin also consider missing ratings from others
  For others consider their own missing ratings
*/
export const isUnrated = (
  user: RoadmapUser | Customer | UserInfo,
  roadmapId: number,
  users: RoadmapUser[] | undefined,
  customers: Customer[] | undefined,
) => {
  let condition: (task: Task) => boolean;
  if (isCustomer(user)) {
    condition = (task) =>
      !!user.representatives?.some((rep) => !ratedByCustomer(user, rep)(task));
  } else {
    condition = awaitsUserRatings(user, roadmapId, customers);
    if (getType(user, roadmapId) === RoleType.Admin)
      condition = or(condition, hasMissingRatings(users, customers));
  }
  return and(not(isCompletedTask), condition);
};

export const unratedTasksAmount = (
  user: RoadmapUser | Customer | UserInfo,
  roadmapId: number,
  tasks: Task[],
  users: RoadmapUser[] | undefined,
  customers: Customer[] | undefined,
) =>
  isCustomer(user) && !user.representatives?.length
    ? tasks.length
    : tasks.filter(isUnrated(user, roadmapId, users, customers)).length;

export const missingDeveloper = (task: Task) => {
  if (isCompletedTask(task)) return () => false;
  const ratedBy = hasUserRating(task);
  return (user: RoadmapUser) =>
    user.type === RoleType.Developer && !ratedBy(user);
};

export const missingCustomer = (task: Task) => (customer: Customer) =>
  !isCompletedTask(task) &&
  !customer.representatives?.every((rep) =>
    ratedByCustomer(customer, rep)(task),
  );

export const getRatingsByType = (ratings: Taskrating[]) => {
  const [value, complexity] = partition(
    ratings,
    ({ dimension }) => dimension === TaskRatingDimension.BusinessValue,
  );
  return { value, complexity };
};

export const getMissingRepresentatives = (
  customer: Customer,
  allUsers: RoadmapUser[],
  task: Task,
) => {
  if (isCompletedTask(task)) return [];
  const missingRepresentativeIds = new Set<number>();
  const ratingsForTask = task.ratings
    .filter((rating) => rating.forCustomer === customer.id)
    .map((e) => e.createdByUser);

  customer.representatives?.forEach(({ id }) => {
    if (!ratingsForTask.includes(id)) missingRepresentativeIds.add(id);
  });
  return allUsers.filter(({ id }) => missingRepresentativeIds.has(id));
};

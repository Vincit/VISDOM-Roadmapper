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
import { partition, groupBy } from './array';

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

  constructor(values: (number | undefined)[] = []) {
    values.forEach((value) => {
      if (value !== undefined) this.add(value);
    });
  }

  get empty() {
    return this.count === 0;
  }

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

export const getRatingsByType = (ratings: Taskrating[]) => {
  const [value, complexity] = partition(
    ratings,
    ({ dimension }) => dimension === TaskRatingDimension.BusinessValue,
  );
  return { value, complexity };
};

const customerWeight = (customers: Customer[] | undefined, id: number) =>
  customers?.find((c) => c.id === id)?.weight;

/**
 * Rating summary for a single task
 *
 * Complexity:
 * - average of complexity ratings
 *
 * Value for customer:
 * - average of value ratings given to the customer in guestion,
 *   if the customer has received at least one rating
 *
 * Value:
 * - the value of the task is calculated from the values of the
 *   individual customers
 * - average
 *   - the average of the customer values
 *   - the range is the same as the range of an individual rating
 * - total
 *   - the sum of customer values
 *   - the range is scaled by the number of customers receiving
 *     value from this task
 *
 * Weighted value:
 * - `Value for customer` and `Value`, but weighted by the customer weights
 */
export const ratingSummary = (task: { ratings: Taskrating[] }) => {
  const ratings = getRatingsByType(task.ratings);
  const values = Array.from(groupBy(ratings.value, (r) => r.forCustomer));
  const valueByCustomerId = new Map(
    values.map(([id, rs]) => [id, new Summary(rs.map((r) => r.value)).avg]),
  );
  const valueForCustomer = (id: number) => valueByCustomerId.get(id);

  return {
    /** The average complexity rating given to the task */
    complexity: () => new Summary(ratings.complexity.map((r) => r.value)).avg,

    /** The average value rating summarised by customer */
    value: () => new Summary(Array.from(valueByCustomerId.values())),

    /** The average value rating for the customer */
    valueForCustomer,

    weighted: (customers: Customer[] | undefined) => ({
      /** The weighted average value rating summarised by customer */
      value: () => {
        const res = new Summary();
        valueByCustomerId.forEach((value, id) => {
          const w = customerWeight(customers, id);
          if (w !== undefined) res.add(value * w);
        });
        return res;
      },

      /** The weighted average value rating for the customer */
      valueForCustomer: (id: number) => {
        const w = customerWeight(customers, id);
        const value = valueForCustomer(id);
        return w === undefined || value === undefined ? undefined : value * w;
      },
    }),
  };
};

/**
 * Rating summary for a milestone, or a collection of tasks
 *
 * Each summary includes the total and average
 * of the values from the individual tasks.
 *
 * Complexity:
 * - summary of the complexity ratings for the individual tasks
 *
 * Value for customer:
 * - summary of the values for the customer from the individual tasks
 *
 * Value:
 * - summary of the values for the individual tasks using the corresponding
 *   `total` or `average` value calculation for each task
 *
 * Weighted value:
 * - `Value for customer` and `Value`, but weighted by the customer weights
 */
export const milestoneRatingSummary = (tasks: { ratings: Taskrating[] }[]) => {
  const summaries = tasks.map(ratingSummary);

  return {
    complexity: () => new Summary(summaries.map((task) => task.complexity())),

    // TODO: Should this be total, average or both? And which should be used where?
    value: (taskValue: 'total' | 'avg') =>
      new Summary(summaries.map((task) => task.value()[taskValue])),

    valueForCustomer: (id: number) => {
      const res = new Summary(
        summaries.map((task) => task.valueForCustomer(id)),
      );
      return res.empty ? undefined : res;
    },

    weighted: (customers: Customer[] | undefined) => ({
      value: (taskValue: 'total' | 'avg') =>
        new Summary(
          summaries.map((task) => task.weighted(customers).value()[taskValue]),
        ),

      valueForCustomer: (id: number) => {
        const w = customerWeight(customers, id);
        if (w === undefined) return undefined;
        const res = new Summary(
          summaries.map((task) => {
            const value = task.valueForCustomer(id);
            return value === undefined ? undefined : value * w;
          }),
        );
        return res.empty ? undefined : res;
      },
    }),
  };
};

export const customerStakes = <T>(
  valueForCustomer: (id: number) => T | undefined,
  customers: Customer[],
): [Customer, T][] =>
  customers.flatMap((customer) => {
    const value = valueForCustomer(customer.id);
    return value === undefined ? [] : [[customer, value]];
  });

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

export const isCompletedTask = (task: Task) =>
  task.status === TaskStatus.COMPLETED;

type Predicate<T> = (t: T) => boolean;
const not = <T>(f: Predicate<T>) => (t: T) => !f(t);
const or = <T>(...fs: Predicate<T>[]) => (t: T) =>
  fs.reduce((res, f) => res || f(t), false);
const and = <T>(...fs: Predicate<T>[]) => (t: T) =>
  fs.reduce((res, f) => res && f(t), true);

const ratedByUser = (user: RoadmapUser | UserInfo) => (task: Task) =>
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

const priority = (value: Summary, complexity: number) => {
  if (!value.total) return -2;
  if (!complexity) return -1;
  return value.total / complexity;
};

const taskPriority = (task: Task) => {
  const { value, complexity } = ratingSummary(task);
  return priority(value(), complexity());
};

export const weightedTaskPriority = (customers: Customer[] | undefined) => (
  task: Task,
) => {
  const summary = ratingSummary(task);
  const { value } = summary.weighted(customers);
  return priority(value(), summary.complexity());
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
      return sortKeyNumeric(taskPriority);
    case SortingTypes.SORT_AVG_VALUE:
      return sortKeyNumeric((t) => ratingSummary(t).value().avg);
    case SortingTypes.SORT_COMPLEXITY:
      return sortKeyNumeric((t) => ratingSummary(t).complexity());
    case SortingTypes.SORT_TOTAL_VALUE:
      return sortKeyNumeric((t) => ratingSummary(t).value().total);
    default:
      break;
  }
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

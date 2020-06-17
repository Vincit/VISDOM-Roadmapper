import { Task, TaskRatingDimension } from '../redux/roadmaps/types';

export const calcTaskAverageRating = (
  dimension: TaskRatingDimension,
  task: Task,
) => {
  let sum = 0;
  let count = 0;
  task.ratings.forEach((rating) => {
    if (rating.dimension !== dimension) return;
    count += 1;
    sum += rating.value;
  });

  if (count > 0) {
    return sum / count;
  }
  return -1;
};

export const calcTaskPriority = (task: Task) => {
  const avgBusinessRating = calcTaskAverageRating(
    TaskRatingDimension.BusinessValue,
    task,
  );
  if (avgBusinessRating < 0) return -2;
  const avgWorkRating = calcTaskAverageRating(
    TaskRatingDimension.RequiredWork,
    task,
  );
  if (avgWorkRating < 0) return -1;

  return avgBusinessRating / avgWorkRating;
};

import { FC } from 'react';
import { ArrowDownCircle, ArrowUpCircle } from 'react-bootstrap-icons';
import { SortingOrders } from '../utils/SortUtils';

export const SortingArrow: FC<{ order: SortingOrders }> = ({ order }) =>
  order === SortingOrders.ASCENDING ? <ArrowUpCircle /> : <ArrowDownCircle />;

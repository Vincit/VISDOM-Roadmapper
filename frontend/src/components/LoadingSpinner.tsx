import { Spinner } from 'react-bootstrap';

export const LoadingSpinner = () => {
  return (
    <Spinner animation="border" role="status" className="m-auto">
      <span className="sr-only">Loading...</span>
    </Spinner>
  );
};

import { render, screen } from '@testing-library/react';
import Submit from './Submit';

test('renders learn react link', () => {
  render(<Submit />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

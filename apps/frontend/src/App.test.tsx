import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';

test('renders planora landing', () => {
  render(<MemoryRouter><AuthProvider><App /></AuthProvider></MemoryRouter>);
  expect(screen.getByText('Planora')).toBeInTheDocument();
});

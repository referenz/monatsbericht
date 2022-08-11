import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('Startbildschirm wird gerendert', () => {
    render(<App />);
    const linkElement = screen.getByText(/Aktuellen Monatsbericht auf dieses/i);
    expect(linkElement).toBeInTheDocument();
});

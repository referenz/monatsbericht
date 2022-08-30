import { render, screen } from '@testing-library/react';
import App from './App';

// Bug: https://github.com/react-bootstrap/react-bootstrap/issues/6426
// nach Behebung dieses Bugs sollte der beforeAll-Workaround auch nicht mehr nötig sein

/*
beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        })),
    });
});
*/
test.skip('rendert Startbildschirm', () => {
    render(<App />);
    const linkElement = screen.queryByText(/Aktuellen Monatsbericht auf dieses/i);
    expect(linkElement).toBeInTheDocument();
});

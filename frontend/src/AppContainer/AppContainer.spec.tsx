import { render, screen } from '@testing-library/react';
import Main from './AppContainer';
import { describe, it, expect } from 'vitest';
import  AppContext from '../context/AppContext/AppContext';
import { mockAppContextValue } from '../test-utils/mockAppContextValue';

describe('Main component', () => {
  const renderWithProviders = () => {
    render(
        <AppContext.Provider value={mockAppContextValue}>
          <Main />
        </AppContext.Provider>
    );
  };

  it("renders the Main component correctly", () => {
    renderWithProviders();
    expect(
      screen.getByText("Vettä kengässä? Maaston kosteus ja kulkukelpoisuus")
    ).toBeInTheDocument();
    expect(screen.getByText("Havainnon sijainti")).toBeInTheDocument();
    expect(screen.getByText("Kuva jäljestä")).toBeInTheDocument();
    expect(screen.getByText("Maaston kosteus")).toBeInTheDocument();
    expect(screen.getByText("Arvio havainnon varmuudesta")).toBeInTheDocument();
    expect(screen.getByText("Lähetä")).toBeInTheDocument();
  });

  it('renders Main component', () => {
    renderWithProviders();
    const element = screen.getByTestId(/main-view/i);
    expect(element).toBeInTheDocument();
  });


});
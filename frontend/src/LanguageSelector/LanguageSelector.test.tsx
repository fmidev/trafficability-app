import { render, screen, fireEvent } from "@testing-library/react";
import LanguageSelector from "./LanguageSelector";
import { describe, it, expect, vi } from "vitest";
import { ChakraProvider } from "@chakra-ui/react";

describe("LanguageSelector component", () => {
  const mockSetCurrentLanguage = vi.fn();

  const renderWithProviders = (abbreviation: string) => {
    render(
      <ChakraProvider>
        <LanguageSelector
          abbreviation={abbreviation}
          setCurrentLanguage={mockSetCurrentLanguage}
        />
      </ChakraProvider>
    );
  };

  it("renders the LanguageSelector component correctly", () => {
    renderWithProviders("en");
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("displays the correct flag based on the abbreviation", () => {
    renderWithProviders("fi");
    const flag = screen.getByTitle("Suomi");
    expect(flag).toBeInTheDocument();
  });

  it("opens the menu and displays language options when clicked", () => {
    renderWithProviders("en");
    const button = screen.getByRole("button");
    fireEvent.click(button);
    const finnishOption = screen.getByText("Suomi");
    const englishOption = screen.getByText("English");
    expect(finnishOption).toBeInTheDocument();
    expect(englishOption).toBeInTheDocument();
  });

  it("calls setCurrentLanguage with the correct abbreviation when a language is selected", () => {
    renderWithProviders("en");
    const button = screen.getByRole("button");
    fireEvent.click(button);
    const finnishOption = screen.getByText("Suomi");
    fireEvent.click(finnishOption);
    expect(mockSetCurrentLanguage).toHaveBeenCalledWith("fi");
  });
});

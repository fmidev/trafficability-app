import { render, screen, fireEvent } from "@testing-library/react";
import FileUploadComponent from "./FileUploadComponent";
import { describe, it, expect, vi } from "vitest";
import AppContext from "../../context/AppContext/AppContext";
import { mockAppContextValue } from "../../test-utils/mockAppContextValue";

describe("File upload component", () => {
  const mockOnChange = vi.fn();
  const renderWithProviders = () => {
    render(
      <AppContext.Provider value={mockAppContextValue}>
        <FileUploadComponent
          onChange={mockOnChange}
          accept="image/*"
          multiple={false}
          buttonText="Upload File"
          selectedFileName={""}
          setfileDateTimeOriginal={vi.fn()}
          setFileGeoLocation={vi.fn()}
        />
      </AppContext.Provider>
    );
  };

  it("renders the File upload component correctly", async () => {
    renderWithProviders();
    const fileInput = screen.getByTestId("file-input");
    const file = new File(["dummy content"], "example.png", {
      type: "image/png",
    });
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(mockOnChange).toHaveBeenCalledWith({ data: file, name: file.name });
  });

  it("handles file drop via drag-and-drop", () => {
    renderWithProviders();
    const dropZone = screen.getByTestId("drop-zone");
    const file = new File(["dummy content"], "example.png", {
      type: "image/png",
    });

    fireEvent.dragEnter(dropZone);
    fireEvent.dragOver(dropZone);
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file],
      },
    });

    expect(mockOnChange).toHaveBeenCalledWith({ data: file, name: file.name });
  });
});

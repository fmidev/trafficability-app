import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CameraAccessComponent from './CameraAccessComponent';
import { describe, it, expect, vi } from 'vitest';
import  AppContext from '../../context/AppContext/AppContext';
import { mockAppContextValue } from '../../test-utils/mockAppContextValue';

describe('Camera access component', () => {
  beforeAll(() => {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [
            { stop: vi.fn() }
          ],
        }),
      },
    });
  });
  const mockSetIsStreamActive = vi.fn();
  const renderWithProviders = (isStreamActive = false) => {
    render(
        <AppContext.Provider value={mockAppContextValue}>
          <CameraAccessComponent 
            height={'80px'} 
            isStreamActive={isStreamActive} 
            pictureName={''} 
            mobilePictureName={''} 
            setIsStreamActive={mockSetIsStreamActive}
            setFile={vi.fn()}
            updatePicture={vi.fn()} 
            setMobilePicture={vi.fn()} 
            />
        </AppContext.Provider>
    );
  };

  it("renders the Camera access component correctly", async () => {
    renderWithProviders();

    const startStreamButton = screen.getByTestId('camera-icon');
    fireEvent.click(startStreamButton);
    await waitFor(() => {
      expect(mockSetIsStreamActive).toHaveBeenCalledWith(true);
    });

    const videoElement = screen.getByTestId('video');

    renderWithProviders(true);
    expect(videoElement).toBeInTheDocument();

    const captureButton = screen.getByTestId('capture-button');
    expect(captureButton).toBeInTheDocument();
  });

});
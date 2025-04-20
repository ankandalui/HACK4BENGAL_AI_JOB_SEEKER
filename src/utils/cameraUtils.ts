// cameraUtils.ts

// Setup camera
export const setupCamera = async (
  videoRef: React.RefObject<HTMLVideoElement>,
  setCameraActive: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
): Promise<MediaStream | null> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      setCameraActive(true);
    }

    return stream;
  } catch (err) {
    setError(
      `Error accessing camera: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
    console.error("Error accessing camera:", err);
    return null;
  }
};

// Stop camera
export const stopCamera = (stream: MediaStream | null): void => {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
};

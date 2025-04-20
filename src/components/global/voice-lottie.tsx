import { Player } from "@lottiefiles/react-lottie-player";

const VoiceLottie = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center gap-6">
        <Player
          autoplay
          loop
          src="/animations/voice-animation.json" // Corrected path to animations folder
          style={{ height: "150px", width: "150px" }}
        />
        <p className="text-xl font-medium text-foreground/80">Navigating...</p>
      </div>
    </div>
  );
};

export default VoiceLottie;

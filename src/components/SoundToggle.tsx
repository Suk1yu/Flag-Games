import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { soundManager } from "@/utils/sound";

const SoundToggle = () => {
  const [isMuted, setIsMuted] = useState(false);

  const toggleSound = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    soundManager.setMuted(newMutedState);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleSound}
      className="fixed top-4 right-4 z-50 bg-card/80 backdrop-blur-sm border-border hover:bg-card"
    >
      {isMuted ? (
        <VolumeX className="w-5 h-5" />
      ) : (
        <Volume2 className="w-5 h-5" />
      )}
    </Button>
  );
};

export default SoundToggle;

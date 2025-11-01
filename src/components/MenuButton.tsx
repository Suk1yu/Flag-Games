import { useState, useEffect } from "react";
import { Menu, Volume2, VolumeX, Sun, Moon, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { soundManager } from "@/utils/sound";

interface MenuButtonProps {
  onLeaderboardClick: () => void;
}

const MenuButton = ({ onLeaderboardClick }: MenuButtonProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme") || "dark";
    setIsDark(theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
  }, []);

  const toggleSound = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    soundManager.setMuted(newMutedState);
  };

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    setIsDark(!isDark);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("light", newTheme === "light");
  };

  const handleLeaderboardClick = () => {
    setIsOpen(false);
    onLeaderboardClick();
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 right-4 z-50 bg-card/80 backdrop-blur-sm border-border hover:bg-card"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-64 bg-card/95 backdrop-blur-md border-border">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 mt-6">
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={toggleSound}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
            <span>{isMuted ? "Aktifkan Suara" : "Matikan Suara"}</span>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={toggleTheme}
          >
            {isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
            <span>{isDark ? "Mode Terang" : "Mode Gelap"}</span>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={handleLeaderboardClick}
          >
            <Trophy className="w-5 h-5" />
            <span>Leaderboard</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MenuButton;

import { Heart } from "lucide-react";

interface HeartsProps {
  lives: number;
  maxLives: number;
}

const Hearts = ({ lives, maxLives }: HeartsProps) => {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: maxLives }).map((_, index) => (
        <Heart
          key={index}
          className={`w-7 h-7 transition-all duration-300 ${
            index < lives
              ? "fill-red-500 text-red-500 scale-100"
              : "fill-transparent text-muted-foreground/30 scale-90"
          }`}
        />
      ))}
    </div>
  );
};

export default Hearts;

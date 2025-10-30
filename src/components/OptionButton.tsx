import { Button } from "@/components/ui/button";

interface OptionButtonProps {
  option: string;
  onClick: () => void;
  disabled?: boolean;
}

const OptionButton = ({ option, onClick, disabled }: OptionButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="outline"
      className="w-full h-14 sm:h-16 text-base sm:text-xl font-bold backdrop-blur-sm transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
    >
      {option}
    </Button>
  );
};

export default OptionButton;

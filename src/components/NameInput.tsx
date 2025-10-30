import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NameInputProps {
  onNameChange: (name: string) => void;
}

const NameInput = ({ onNameChange }: NameInputProps) => {
  const [name, setName] = useState("");

  useEffect(() => {
    // Load name from localStorage
    const savedName = localStorage.getItem("playerName") || "";
    setName(savedName);
    onNameChange(savedName);
  }, []);

  const handleChange = (value: string) => {
    setName(value);
    localStorage.setItem("playerName", value);
    onNameChange(value);
  };

  return (
    <div className="w-full">
      <Input
        type="text"
        placeholder="Masukkan nama kamu..."
        value={name}
        onChange={(e) => handleChange(e.target.value)}
        className="text-center text-base sm:text-lg font-bold h-14 border-0 border-b-2 border-border hover:border-primary/50 transition-colors bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-primary"
        maxLength={20}
      />
    </div>
  );
};

export default NameInput;

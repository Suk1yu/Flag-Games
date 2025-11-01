import { useState, useEffect } from "react";
import { RotateCcw, Trophy, Zap, Clock, Play } from "lucide-react";
import FlagCard from "@/components/FlagCard";
import OptionButton from "@/components/OptionButton";
import Hearts from "@/components/Hearts";
import MenuButton from "@/components/MenuButton";
import LeaderboardModal from "@/components/LeaderboardModal";
import NameInput from "@/components/NameInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { soundManager } from "@/utils/sound";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface Country {
  name: {
    common: string;
  };
  flags: {
    svg: string;
  };
}

const MAX_LIVES = 3;
const TIMER_DURATION = 10;

type GameState = "menu" | "playing" | "gameOver";

const Index = () => {
  const [gameState, setGameState] = useState<GameState>("menu");
  const [countries, setCountries] = useState<Country[]>([]);
  const [currentFlag, setCurrentFlag] = useState<Country | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [isAnswered, setIsAnswered] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [shakeFlag, setShakeFlag] = useState(false);
  const [correctStreak, setCorrectStreak] = useState(0);

  // Fetch countries from API
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all?fields=name,flags");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Ensure data is an array before filtering
        if (!Array.isArray(data)) {
          throw new Error("Invalid data format received from API");
        }
        
        // Filter countries with valid flags and names
        const validCountries = data.filter(
          (country: Country) => country.flags?.svg && country.name?.common
        );
        
        setCountries(validCountries);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching countries:", error);
        toast.error("Gagal memuat data negara. Coba refresh halaman.");
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !isAnswered && gameState === "playing") {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswered && gameState === "playing") {
      handleTimeout();
    }
  }, [timeLeft, isAnswered, gameState]);

  // Generate new round
  useEffect(() => {
    if (countries.length > 0 && gameState === "playing" && lives > 0) {
      generateNewRound();
    }
  }, [countries, gameState]);

  const generateNewRound = () => {
    if (countries.length < 4) return;

    // Pick random correct answer
    const correctCountry = countries[Math.floor(Math.random() * countries.length)];
    setCurrentFlag(correctCountry);

    // Generate 3 wrong answers
    const wrongOptions: string[] = [];
    while (wrongOptions.length < 3) {
      const randomCountry = countries[Math.floor(Math.random() * countries.length)];
      if (
        randomCountry.name.common !== correctCountry.name.common &&
        !wrongOptions.includes(randomCountry.name.common)
      ) {
        wrongOptions.push(randomCountry.name.common);
      }
    }

    // Shuffle options
    const allOptions = [...wrongOptions, correctCountry.name.common];
    const shuffled = allOptions.sort(() => Math.random() - 0.5);
    setOptions(shuffled);
    setTimeLeft(TIMER_DURATION);
    setIsAnswered(false);
  };

  const calculateScore = (timeRemaining: number) => {
    // Fast answer (7-10 seconds): 100 points
    if (timeRemaining >= 7) return 100;
    // Medium answer (4-6 seconds): 70 points
    if (timeRemaining >= 4) return 70;
    // Slow answer (1-3 seconds): 50 points
    if (timeRemaining >= 1) return 50;
    // Very slow (0 seconds): 20 points
    return 20;
  };

  const saveScore = async () => {
    const finalName = playerName.trim() || "Player";
    const { error } = await supabase.from("leaderboard").insert({
      name: finalName,
      score: score,
    });

    if (error) {
      if (error.code === "23505") {
        // Unique constraint violation - update existing score if new score is higher
        const { data: existingData } = await supabase
          .from("leaderboard")
          .select("score")
          .eq("name", finalName)
          .single();

        if (existingData && score > existingData.score) {
          await supabase
            .from("leaderboard")
            .update({ score: score })
            .eq("name", finalName);
          toast.success("Skor baru lebih tinggi! Leaderboard diperbarui! 🎉");
        } else {
          toast.info("Skor kamu belum mengalahkan rekor sebelumnya");
        }
      } else {
        console.error("Error saving score:", error);
        toast.error("Gagal menyimpan skor");
      }
    } else {
      toast.success("Skor berhasil disimpan ke leaderboard! 🏆");
    }
  };

  const handleTimeout = () => {
    if (!currentFlag || isAnswered) return;
    
    setIsAnswered(true);
    setCorrectStreak(0); // Reset streak on timeout
    setShakeFlag(true);
    setTimeout(() => setShakeFlag(false), 500);
    
    const newLives = lives - 1;
    setLives(newLives);
    
    if (newLives <= 0) {
      soundManager.playGameOver();
      toast.error("Game Over! 😢", {
        description: `Waktu habis! Jawabannya: ${currentFlag.name.common}`,
      });
      saveScore();
      setGameState("gameOver");
    } else {
      soundManager.playWrong();
      toast.error("Waktu Habis! ⏰", {
        description: `Jawabannya: ${currentFlag.name.common}. Sisa nyawa: ${newLives}`,
      });
      setTimeout(() => generateNewRound(), 1500);
    }
  };

  const handleAnswer = (selectedOption: string) => {
    if (!currentFlag || isAnswered) return;

    setIsAnswered(true);
    
    if (selectedOption === currentFlag.name.common) {
      // Correct answer
      const points = calculateScore(timeLeft);
      soundManager.playCorrect();
      setScore(score + points);
      
      // Track correct streak for bonus life
      const newStreak = correctStreak + 1;
      setCorrectStreak(newStreak);
      
      // Award bonus life every 3 correct answers
      if (newStreak % 3 === 0 && lives < MAX_LIVES) {
        setLives(lives + 1);
        toast.success("Benar! 🎉 Bonus Nyawa! ❤️", {
          description: `+${points} poin! 3 jawaban benar berturut-turut!`,
        });
      } else {
        toast.success("Benar! 🎉", {
          description: `+${points} poin! Total skor: ${score + points}`,
        });
      }
      
      setTimeout(() => generateNewRound(), 1000);
    } else {
      // Wrong answer
      setCorrectStreak(0); // Reset streak on wrong answer
      setShakeFlag(true);
      setTimeout(() => setShakeFlag(false), 500);
      
      const newLives = lives - 1;
      setLives(newLives);
      
      if (newLives <= 0) {
        soundManager.playGameOver();
        toast.error("Game Over! 😢", {
          description: `Jawabannya adalah: ${currentFlag.name.common}`,
        });
        saveScore();
        setGameState("gameOver");
      } else {
        soundManager.playWrong();
        toast.error("Salah! 💔", {
          description: `Jawabannya adalah: ${currentFlag.name.common}. Sisa nyawa: ${newLives}`,
        });
        setTimeout(() => generateNewRound(), 1500);
      }
    }
  };

  const startGame = () => {
    if (!playerName.trim()) {
      toast.error("Silakan masukkan nama kamu terlebih dahulu! 📝");
      return;
    }
    setScore(0);
    setLives(MAX_LIVES);
    setCorrectStreak(0);
    setGameState("playing");
  };

  const restartGame = () => {
    setScore(0);
    setLives(MAX_LIVES);
    setCorrectStreak(0);
    setGameState("playing");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="w-24 h-24 mx-auto relative">
              <div className="absolute inset-0 rounded-full border-4 border-primary/30" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl">🌍</span>
              </div>
            </div>
          </motion.div>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-semibold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent"
          >
            Memuat bendera dunia...
          </motion.p>
        </div>
      </div>
    );
  }

  // Menu Screen
  if (gameState === "menu") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 relative">
        <MenuButton onLeaderboardClick={() => setShowLeaderboard(true)} />
        
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8 bg-card/50 backdrop-blur-md p-8 sm:p-12 rounded-3xl shadow-2xl border border-border"
        >
          <h1 className="text-5xl sm:text-7xl font-black uppercase typing-animation bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent" style={{ fontFamily: "sans-serif" }}>
            FLAG MASTER
          </h1>

          <div className="mb-6">
            <NameInput onNameChange={setPlayerName} />
          </div>

          <div className="flex flex-col gap-4">
            <Button
              onClick={startGame}
              size="lg"
              className="w-full gap-2 font-bold py-6 text-lg sm:text-xl"
            >
              <Play className="w-5 h-5 sm:w-6 sm:h-6" />
              MULAI PERMAINAN
            </Button>

            <Button
              onClick={() => setShowLeaderboard(true)}
              size="lg"
              variant="outline"
              className="w-full gap-2 font-bold py-6 text-lg sm:text-xl"
            >
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
              LEADERBOARD
            </Button>
          </div>
        </motion.div>

        <LeaderboardModal
          open={showLeaderboard}
          onOpenChange={setShowLeaderboard}
        />
      </div>
    );
  }

  // Playing Screen
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 relative">
      <MenuButton onLeaderboardClick={() => setShowLeaderboard(true)} />

      {/* Game Area */}
      <main className="w-full max-w-4xl space-y-6 fade-in relative z-10">
        {currentFlag && (
          <>
            <motion.div
              animate={shakeFlag ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.5 }}
            >
              <FlagCard 
                flagUrl={currentFlag.flags.svg} 
                countryName={currentFlag.name.common}
              />
            </motion.div>

            {/* Score & Lives Display */}
            <div className="flex justify-center items-center gap-2 sm:gap-3">
              <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg px-3 sm:px-4 py-2 shadow-lg">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                  <span className="text-lg sm:text-2xl font-bold">{score}</span>
                </div>
              </div>
              
              <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg px-3 sm:px-4 py-2 shadow-lg">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  <span className="text-lg sm:text-2xl font-bold">{timeLeft}s</span>
                </div>
              </div>
              
              <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg px-3 sm:px-4 py-2 shadow-lg">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                  <Hearts lives={lives} maxLives={MAX_LIVES} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {options.map((option, index) => (
                <OptionButton
                  key={index}
                  option={option}
                  onClick={() => handleAnswer(option)}
                  disabled={isAnswered}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Game Over Dialog */}
      <Dialog open={gameState === "gameOver"} onOpenChange={() => setGameState("menu")}>
        <DialogContent className="sm:max-w-md bg-card border-2 border-border">
          <DialogHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="mx-auto w-20 h-20 rounded-full bg-primary flex items-center justify-center"
            >
              <Trophy className="w-10 h-10 text-primary-foreground" />
            </motion.div>
            <DialogTitle className="text-3xl font-bold">
              GAME OVER!
            </DialogTitle>
            <DialogDescription className="text-lg pt-2 space-y-2">
              <div className="text-muted-foreground font-semibold">Skor Akhir</div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="text-6xl font-black"
              >
                {score}
              </motion.div>
              <div className="text-sm text-muted-foreground pt-2 font-medium">
                {score === 0 && "Jangan menyerah! Coba lagi!"}
                {score > 0 && score <= 200 && "Lumayan! Terus berlatih!"}
                {score > 200 && score <= 500 && "Bagus! Kamu hebat!"}
                {score > 500 && "Luar biasa! Kamu master bendera!"}
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Button
              onClick={restartGame}
              size="lg"
              className="w-full gap-2 font-bold py-6 text-lg"
            >
              <RotateCcw className="w-5 h-5" />
              Main Lagi
            </Button>
            <Button
              onClick={() => setShowLeaderboard(true)}
              size="lg"
              variant="outline"
              className="w-full gap-2 font-bold py-6 text-lg"
            >
              <Trophy className="w-5 h-5" />
              Lihat Leaderboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <LeaderboardModal
        open={showLeaderboard}
        onOpenChange={setShowLeaderboard}
      />
    </div>
  );
};

export default Index;

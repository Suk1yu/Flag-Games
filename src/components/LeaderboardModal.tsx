import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  created_at: string;
}

interface LeaderboardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LeaderboardModal = ({ open, onOpenChange }: LeaderboardModalProps) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchLeaderboard();
      subscribeToLeaderboard();
    }
  }, [open]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("leaderboard")
      .select("*")
      .order("score", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching leaderboard:", error);
    } else {
      setLeaderboard(data || []);
    }
    setIsLoading(false);
  };

  const subscribeToLeaderboard = () => {
    const channel = supabase
      .channel("leaderboard-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leaderboard",
        },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-2 border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl sm:text-3xl font-bold flex items-center gap-2 justify-center">
            <Trophy className="w-6 h-6 sm:w-8 sm:h-8" />
            LEADERBOARD
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Memuat...
            </div>
          ) : leaderboard.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Belum ada skor yang tercatat</p>
          ) : (
            leaderboard.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between bg-card/80 backdrop-blur-sm border border-border rounded-lg p-3 sm:p-4"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className={`text-xl sm:text-2xl font-bold ${
                    index === 0 ? "text-yellow-500" : 
                    index === 1 ? "text-gray-400" : 
                    index === 2 ? "text-orange-400" : ""
                  }`}>
                    #{index + 1}
                  </span>
                  <span className="font-semibold text-base sm:text-lg">{entry.name}</span>
                </div>
                <span className="font-bold text-lg sm:text-xl">{entry.score}</span>
              </motion.div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeaderboardModal;

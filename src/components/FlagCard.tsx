interface FlagCardProps {
  flagUrl: string;
  countryName: string;
}

const FlagCard = ({ flagUrl, countryName }: FlagCardProps) => {
  return (
    <div className="w-full bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-4 sm:p-6 shadow-2xl hover-lift">
      <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg bg-muted/50">
        <img
          src={flagUrl}
          alt={`Flag of ${countryName}`}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  );
};

export default FlagCard;

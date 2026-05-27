import type { ContractCard } from "../game/types";

const TIER_STYLE: Record<string, { background: string; color: string }> = {
  gig:    { background: "#4a3a1a", color: "#d4af37" },
  racket: { background: "#3a1a1a", color: "#e07b7b" },
  score:  { background: "#1a3a1a", color: "#7bca7b" },
};

export function CardLightbox({
  card,
  onClose,
}: {
  card: ContractCard;
  onClose: () => void;
}) {
  const tierStyle = TIER_STYLE[card.tier] ?? TIER_STYLE.gig;
  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-card" onClick={(e) => e.stopPropagation()}>
        {card.artPath && (
          <img
            className="lightbox-art"
            src={card.artPath}
            alt={card.name}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        )}
        <div className="lightbox-body">
          <div className="lightbox-tier" style={tierStyle}>
            {card.tier.toUpperCase()}
          </div>
          <h3 className="lightbox-name">{card.name}</h3>
          <div className="lightbox-stats">
            <span>⏳ {card.deadline} day{card.deadline !== 1 ? "s" : ""}</span>
            <span>★ {card.respect} Respect</span>
            <span>${card.take.toLocaleString()}</span>
          </div>
          <p className="lightbox-objective">{card.objective}</p>
          <button className="lightbox-close" onClick={onClose}>✕ Close</button>
        </div>
      </div>
    </div>
  );
}

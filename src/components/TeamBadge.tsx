import type { Team } from "@/lib/types";

export function TeamBadge({ team, size = 28 }: { team: Team; size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full border border-white/10 font-bold text-pitch"
      style={{
        width: size,
        height: size,
        backgroundColor: team.crestColor,
        fontSize: size * 0.4,
        color: isLight(team.crestColor) ? "#0b1220" : "#ffffff",
      }}
      title={team.name}
    >
      {team.shortName.slice(0, 2).toUpperCase()}
    </span>
  );
}

function isLight(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

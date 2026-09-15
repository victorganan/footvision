import Link from "next/link";

export function SectionHeader({ title, href, cta }: { title: string; href?: string; cta?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="font-display text-lg font-bold text-white">{title}</h2>
      {href && (
        <Link href={href} className="text-sm font-medium text-accent hover:underline">
          {cta ?? "Ver todo"} →
        </Link>
      )}
    </div>
  );
}

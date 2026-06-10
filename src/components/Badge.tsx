const palettes: Record<string, string> = {
  green: "bg-pitch-100 text-pitch-700",
  gray: "bg-gray-100 text-gray-600",
  blue: "bg-blue-100 text-blue-700",
  orange: "bg-orange-100 text-orange-700",
  red: "bg-red-100 text-red-600",
};

export default function Badge({ color = "gray", children }: { color?: string; children: React.ReactNode }) {
  return (
    <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-semibold ${palettes[color] ?? palettes.gray}`}>
      {children}
    </span>
  );
}

export function statusColor(status: string) {
  if (status === "OPEN") return "green";
  if (status === "MATCHED" || status === "DONE") return "blue";
  return "gray";
}

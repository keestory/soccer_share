import Link from "next/link";
import { REGIONS } from "@/lib/constants";

export default function RegionFilter({
  basePath,
  current,
  allLabel = "전체",
}: {
  basePath: string;
  current?: string;
  allLabel?: string;
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <Link
        href={basePath}
        className={`rounded-full px-3 py-1 text-xs font-semibold ${!current ? "bg-pitch-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-pitch-500"}`}
      >
        {allLabel}
      </Link>
      {REGIONS.map((r) => (
        <Link
          key={r}
          href={`${basePath}?region=${encodeURIComponent(r)}`}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${current === r ? "bg-pitch-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-pitch-500"}`}
        >
          {r.replace("서울 ", "")}
        </Link>
      ))}
    </div>
  );
}

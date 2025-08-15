import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaClock } from "react-icons/fa";

function timeAgo(ms) {
  const now = Date.now();
  const diff = Math.max(0, now - ms);

  const MINUTE = 60 * 1000;
  const HOUR   = 60 * MINUTE;
  const DAY    = 24 * HOUR;
  const WEEK   = 7 * DAY;
  const MONTH  = 30 * DAY;
  const YEAR   = 365 * DAY;

  if (diff < MINUTE) return "há instantes";
  if (diff < HOUR) {
    const m = Math.floor(diff / MINUTE);
    return `há ${m} minuto${m === 1 ? "" : "s"}`;
  }
  if (diff < DAY) {
    const h = Math.floor(diff / HOUR);
    return `há ${h} hora${h === 1 ? "" : "s"}`;
  }
  if (diff < WEEK) {
    const d = Math.floor(diff / DAY);
    return `há ${d} dia${d === 1 ? "" : "s"}`;
  }
  if (diff < MONTH) {
    const w = Math.floor(diff / WEEK);
    return `há ${w} semana${w === 1 ? "" : "s"}`;
  }
  if (diff < YEAR) {
    const mo = Math.floor(diff / MONTH);
    return `há ${mo} ${mo === 1 ? "mês" : "meses"}`;
  }
  const y = Math.floor(diff / YEAR);
  return `há ${y} ano${y === 1 ? "" : "s"}`;
}

export default function ProductCard({ title, price, imagem_url_original, url, marketplace, date }) {
  return (
    <Card className="w-full max-w-sm rounded-2xl shadow-md overflow-hidden flex flex-col">
      <img
        src={imagem_url_original}
        alt={title}
        className="w-full h-48 object-cover border-b"
      />
      <CardContent className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg mb-4 font-semibold flex-grow">{title}</h3>

        <div className="mt-8">
          <div className="mb-1 flex justify-end">
            <p className="text-sm font-semibold text-gray-700">{marketplace}</p>
          </div>

          <div className="flex items-center justify-between mt-auto mb-4">
            <p className="text-md rounded font-bold text-gray-700">{price}</p>
            {date && (
              <div className="flex items-center text-xs text-gray-500">
                <FaClock className="mr-1" />
                <span>{timeAgo(date)}</span>
              </div>
            )}
          </div>

          <Button asChild className="w-full">
            <a href={url} target="_blank" rel="noopener noreferrer">
              Visitar anúncio
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
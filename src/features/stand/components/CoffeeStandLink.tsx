import Link from "next/link";

export function CoffeeStandLink() {
  return (
    <div className="text-center">
      <p className="text-sm text-haicha">
        三十日珈琲のコーヒーは、上野原駅北口そばの見晴亭でもお楽しみいただけます。
      </p>
      <Link
        href="/stand"
        className="inline-flex min-h-11 items-center gap-2 text-sm text-karekusa underline underline-offset-4 hover:text-karekusa-dark"
      >
        見晴亭のコーヒースタンド・営業日を見る
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}

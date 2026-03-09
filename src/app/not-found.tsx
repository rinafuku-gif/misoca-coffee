import Link from "next/link";

export default function NotFound() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center py-20 overflow-hidden">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <p className="text-sm tracking-[0.3em] text-gold font-medium mb-6">
          404
        </p>
        <h1 className="font-serif text-3xl md:text-5xl text-konsumi mb-6 leading-tight">
          お探しのページが
          <br />
          見つかりませんでした
        </h1>
        <div className="w-16 h-px bg-gold mx-auto mb-10" />
        <p className="text-haicha text-lg leading-loose mb-12">
          ページが移動または削除された可能性があります。
          <br />
          以下のリンクからお探しの情報をご覧ください。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-block bg-gold hover:bg-gold-dark text-white px-10 py-4 rounded text-lg font-medium transition-colors"
          >
            トップページへ
          </Link>
          <Link
            href="/shop"
            className="inline-block border-2 border-karekusa text-karekusa hover:bg-karekusa hover:text-white px-10 py-4 rounded text-lg font-medium transition-all duration-300"
          >
            オンラインショップ
          </Link>
          <Link
            href="/experience"
            className="inline-block border-2 border-karekusa text-karekusa hover:bg-karekusa hover:text-white px-10 py-4 rounded text-lg font-medium transition-all duration-300"
          >
            焙煎体験
          </Link>
        </div>
      </div>
    </section>
  );
}

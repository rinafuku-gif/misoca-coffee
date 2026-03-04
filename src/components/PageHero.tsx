interface PageHeroProps {
  title: string;
  subtitle: string;
  description?: string;
}

export function PageHero({ title, subtitle, description }: PageHeroProps) {
  return (
    <section className="bg-tsuchikabe py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <p className="text-sm tracking-[0.3em] text-haicha mb-3">{title}</p>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-konsumi mb-4">
          {subtitle}
        </h1>
        {description && (
          <p className="text-haicha leading-relaxed max-w-2xl mx-auto">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}

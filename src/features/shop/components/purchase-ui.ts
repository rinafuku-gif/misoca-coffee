/** Shared design tokens only. Importing these from CMS/operations must not
 * load the public Next.js navigation, image or animation components. */
export const purchaseUi = {
  page: "min-h-screen bg-kominka-white px-5 py-8 text-sumi sm:px-8 sm:py-12",
  container: "mx-auto max-w-3xl",
  section: "border-t border-usuzumi py-10 sm:py-14",
  status: "border-y border-usuzumi bg-tsuchikabe/50 px-5 py-8 sm:px-8",
  heading: "font-serif text-xl font-normal leading-relaxed tracking-wider text-konsumi sm:text-2xl",
  statusTitle: "font-serif text-2xl font-normal leading-relaxed tracking-wider text-konsumi",
  // White on the site's gold is insufficient for small transaction labels.
  primary: "inline-flex min-h-12 max-w-full items-center justify-center rounded-none border border-gold bg-gold px-7 py-3 text-center text-sm font-medium leading-relaxed tracking-wide text-sumi transition-colors duration-300 hover:border-karekusa hover:underline hover:underline-offset-4 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-karekusa",
  secondary: "inline-flex min-h-12 max-w-full items-center justify-center rounded-none border border-karekusa/30 bg-transparent px-7 py-3.5 text-center text-sm font-normal leading-relaxed tracking-wide text-karekusa transition-colors duration-500 hover:bg-karekusa hover:text-white disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-karekusa",
  notice: "border-l-2 border-gold bg-tsuchikabe/60 p-4 text-sm leading-relaxed text-sumi",
  inset: "border-l border-usuzumi pl-5 py-2",
  link: "inline-flex min-h-12 items-center text-sm leading-relaxed text-karekusa underline decoration-usuzumi underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-karekusa",
  select: "min-h-12 min-w-24 rounded-sm border border-usuzumi bg-kominka-white px-3 text-base text-sumi focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-karekusa",
  checkbox: "mt-1 h-5 w-5 shrink-0 accent-karekusa focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-karekusa",
  step: "mb-4 font-[family-name:var(--font-display)] text-[11px] tracking-[0.5em] text-haicha",
} as const;

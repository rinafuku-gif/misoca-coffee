import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // 環境上 /Users/Inaryo 直下に無関係な package-lock.json が存在し、Turbopackが
  // ワークスペースルートをそこだと誤検知して `next dev` 時に依存解決に失敗する事象への対処。
  // 明示的にこのプロジェクト自身をルートに固定する（本番Vercelビルド環境には影響しない安全な変更）。
  turbopack: {
    root: path.resolve(__dirname),
  },
  rewrites: async () => [
    {
      source: "/shindan",
      destination: "/shindan.html",
    },
    // Decap CMS（管理画面）。/admin は既存の注文管理ダッシュボード(src/app/admin)が
    // 使用中のため、CMSは /cms に配置する。index.html 内の <base href="/cms/"> が
    // 相対パス解決を担うため、トレイリングスラッシュの有無どちらでも動作する。
    {
      source: "/cms",
      destination: "/cms/index.html",
    },
    {
      source: "/cms/",
      destination: "/cms/index.html",
    },
  ],
  redirects: async () => [
    {
      source: "/menu",
      destination: "/shop",
      permanent: true,
    },
  ],
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://js.stripe.com",
            "connect-src 'self' https://api.stripe.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://api.open-meteo.com https://get.geojs.io",
            "frame-src https://js.stripe.com https://www.google.com",
            "font-src 'self' https://fonts.gstatic.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: https: blob:",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
          ].join("; "),
        },
        { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
      ],
    },
    {
      // Decap CMS管理画面用のCSP上書き。サイト本体のCSP（上のブロック）より後に
      // 定義することで、同じヘッダーキーは後勝ちになる（Next.js公式仕様）ため
      // /cms 配下だけ緩和したポリシーが適用される。
      // 参考: DecapBridge(git-gateway)の identity_url/gateway_url、CDN配信の
      // unpkg.com は接続先として要許可。local_backend検証用に localhost も許可。
      source: "/cms/:path*",
      headers: [
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com",
            "connect-src 'self' blob: https://unpkg.com https://api.github.com https://gateway.decapbridge.com https://auth.decapbridge.com http://localhost:8081 ws://localhost:8081",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com data:",
            "img-src 'self' data: https: blob:",
            "worker-src 'self' blob:",
            "frame-src 'self'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
          ].join("; "),
        },
      ],
    },
    {
      source: "/_next/static/:path*",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
    {
      source: "/_next/image",
      headers: [
        { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
      ],
    },
    {
      source: "/images/:path*",
      headers: [
        { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
      ],
    },
  ],
};

export default nextConfig;

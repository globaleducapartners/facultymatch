const isDev = process.env.NODE_ENV !== 'production';

// CSP: orígenes de GTM/GA4, Stripe, Supabase y OpenAlex/ORCID. 'unsafe-inline'
// en scripts es necesario para los scripts inline de Next y GTM (sin nonces).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com https://connect.facebook.net https://www.googleadservices.com https://googleads.g.doubleclick.net`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https: http:",
  "media-src 'self' blob: https:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://api.stripe.com https://api.openalex.org https://pub.orcid.org https://www.facebook.com https://connect.facebook.net https://*.doubleclick.net https://www.googleadservices.com https://*.g.doubleclick.net" + (isDev ? " ws: http://localhost:*" : ''),
  "frame-src https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com https://www.googletagmanager.com https://www.facebook.com https://td.doubleclick.net",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'self'",
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
  ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  trailingSlash: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'interesnoitochka.ru',
      },
      {
        protocol: 'https',
        hostname: 'qrtag.net',
      },
      {
        protocol: 'https',
        hostname: 'i.vimeocdn.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pinimg.com',
      },
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_BACKEND_ORIGIN,
      },
    ],
    domains: ['interesnoitochka.ru', 'i.pinimg.com', process.env.NEXT_PUBLIC_BACKEND_ORIGIN],
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: process.env.NEXT_PUBLIC_BACKEND_ORIGIN + '/api/v1/:path*',
        //исключаем редирект моковых запросов
        missing: [{ type: 'header', key: 'x-mock', value: 'true' }],
      },
    ];
  },
};

export default nextConfig;

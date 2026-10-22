const rawBackend =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://127.0.0.1:8000';

// Strip any trailing slashes and trailing /api to guarantee a clean base URL
const cleanBackend = rawBackend.trim().replace(/\/+$/, '').replace(/\/api$/, '');

const nextConfig = {
  env: {
    // Injects BACKEND_URL into the client-side JavaScript bundle as NEXT_PUBLIC_BACKEND_URL
    NEXT_PUBLIC_BACKEND_URL: cleanBackend,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${cleanBackend}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

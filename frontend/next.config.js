/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    reactStrictMode: true,
    images: {
        domains: ['localhost', 'placehold.co'],
    },
    async rewrites() {
        return [
            {
                source: '/api/placeholder/:path*',
                destination: 'https://placehold.co/:path*',
            },
        ];
    },
};

module.exports = nextConfig;
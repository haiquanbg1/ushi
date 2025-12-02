/** @type {import('next').NextConfig} */
const nextConfig = {
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
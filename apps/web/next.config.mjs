/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Rewrite regular requests to the API
    async rewrites() {
        return [
            {
                source: '/v1/:path*',
                destination: 'http://localhost:4000/v1/:path*',
            },
        ];
    },
};

export default nextConfig;

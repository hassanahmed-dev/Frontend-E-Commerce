/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Ensure Sass modules are properly processed
  sassOptions: {
    includePaths: ['./app'],
  },

  // Enable image optimization
  images: {
    domains: ['localhost', 'res.cloudinary.com'], // 👈 Cloudinary added here
  },
};

export default nextConfig;

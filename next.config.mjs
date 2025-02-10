

const isProd = process.env.NODE_ENV === 'production';
const nextConfig = {
  output: 'export', // This is key for generating the 'out' folder
  images: {
    unoptimized: true,
  },
  assetPrefix: isProd ? '/dm' : '',
  basePath: isProd ? '/dm' : '',
  distDir: 'docs',
};

export default nextConfig;

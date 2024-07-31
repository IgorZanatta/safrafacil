/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  assetPrefix: isProd ? '/safrafacil/' : '',
  basePath: isProd ? '/safrafacil' : '',
  trailingSlash: true,
};

module.exports = nextConfig;

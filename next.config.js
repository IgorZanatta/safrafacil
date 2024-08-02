module.exports = {
    reactStrictMode: true,
    async rewrites() {
      return [
        {
          source: '/:path*',
          destination: '/:path*' // Mapeia todas as rotas para as páginas corretas
        }
      ]
    }
  }
  
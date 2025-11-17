/** @type {import('next').NextConfig} */
const isGhActions = process.env.GITHUB_ACTIONS === 'true'
const repoName = (process.env.GITHUB_REPOSITORY || '').split('/')[1] || ''
const envBasePath = process.env.BASE_PATH || ''
const basePath = envBasePath || (isGhActions && repoName ? `/${repoName}` : '')

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: basePath || undefined,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  images: { unoptimized: true },
}

module.exports = nextConfig

import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@nextdj/file-explorer'],
  webpack(config) {
    config.resolve.alias['@nextdj/file-explorer'] = path.resolve(
      __dirname,
      '../../packages/file-explorer/src/index.ts'
    )
    return config
  },
}

export default nextConfig

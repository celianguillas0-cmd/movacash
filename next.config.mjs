/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["better-sqlite3", "pdfkit"],
  outputFileTracingIncludes: { "/api/**/*": ["./fonts/**/*"] },
};
export default nextConfig;

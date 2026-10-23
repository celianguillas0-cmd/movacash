/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@libsql/client", "libsql", "pdfkit"],
  outputFileTracingIncludes: { "/api/**/*": ["./fonts/**/*"] },
};
export default nextConfig;

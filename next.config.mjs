/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@electric-sql/pglite", "pdfkit"],
  outputFileTracingIncludes: { "/api/**/*": ["./fonts/**/*"], "/**/*": ["./node_modules/@electric-sql/pglite/dist/*.wasm", "./node_modules/@electric-sql/pglite/dist/*.data"] },
};
export default nextConfig;

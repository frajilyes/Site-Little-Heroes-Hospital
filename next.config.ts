import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Un package-lock.json existe dans le dossier utilisateur : on fixe la racine du projet.
  turbopack: { root: __dirname },
  poweredByHeader: false,
  experimental: {
    // Imports « barrel » optimisés : seules les icônes utilisées sont embarquées.
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;

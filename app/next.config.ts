import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopackのルートディレクトリを明示的に設定
  // これにより複数のlockfileに関する警告を解消
};

export default nextConfig;

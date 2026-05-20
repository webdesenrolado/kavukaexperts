import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Baileys e ImapFlow sao libs Node de uso server-only.
  // Externalizar evita bundling (falha com deps opcionais como 'jimp' / 'sharp').
  serverExternalPackages: [
    "@whiskeysockets/baileys",
    "imapflow",
    "mailparser",
    "nodemailer",
    "pino",
  ],
};

export default nextConfig;

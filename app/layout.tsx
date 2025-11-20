import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";

// Importamos las fuentes correctamente (Next.js 16)
import { Press_Start_2P } from "next/font/google";
import { Roboto } from "next/font/google";

// Configuración correcta de las fuentes
const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start", // opcional, para usar con CSS variables
});

const roboto = Roboto({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "PokéCatch Gen 1 - Jonathan Jovany Ramírez",
  description: "Pokébanco Generación 1 - Proyecto académico",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      {/* Aplicamos Roboto al body y dejamos Press Start 2P disponible para títulos */}
      <body className={`${roboto.className} ${roboto.variable}`}>
        {children}
      </body>
    </html>
  );
}

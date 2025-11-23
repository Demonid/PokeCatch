import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración para orígenes permitidos en desarrollo (resuelve advertencia CORS)
  allowedDevOrigins: [
    'http://192.168.100.12:3000',  // Su IP local; ajuste el puerto si es necesario
    'http://localhost:3000',       // Para desarrollo local estándar
    // Agregue más orígenes si accede desde otros dispositivos en la red
  ],
  // Configuración para imágenes externas (resuelve error en <Image> con Simple Icons)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.simpleicons.org',
        port: '',
        pathname: '/**',  // Permite cualquier ruta en el CDN para slugs de íconos
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',  // Opcional: Para assets de repositorios GitHub
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Otras configuraciones existentes pueden agregarse aquí si las tiene
};

export default nextConfig;
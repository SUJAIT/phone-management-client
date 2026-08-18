// import type { Metadata, Viewport } from "next";
// import "./globals.css";
// import { AuthProvider } from "@/lib/auth-context";
// import ThemeProvider from "@/components/ThemeProvider";
// import { RealtimeProvider } from "@/lib/realtime";

// export const metadata: Metadata = {
//   title: "Phone Business Manager",
//   description: "Personal phone reselling business management app",
//   manifest: "/manifest.json",
//   appleWebApp: { capable: true, statusBarStyle: "default", title: "Phone Business" },
// };

// export const viewport: Viewport = {
//   width: "device-width",
//   initialScale: 1,
//   maximumScale: 1,
//   userScalable: false,
//   themeColor: [
//     { media: "(prefers-color-scheme: light)", color: "#ffffff" },
//     { media: "(prefers-color-scheme: dark)", color: "#020617" },
//   ],
// };

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors overscroll-none">
//         <ThemeProvider>
//           <AuthProvider>
//             <RealtimeProvider>{children}</RealtimeProvider>
//           </AuthProvider>
//         </ThemeProvider>
//       </body>
//     </html>
//   );
// }


// new update 8/18/26
import type { Metadata, Viewport } from "next";
import "./globals.css";
// Static (non-variable) Roboto weights, used only for the printable invoice. Embedding a
// real webfont sidesteps the system-font "l" rendering bug entirely -- see globals.css.
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/600.css";
import "@fontsource/roboto/700.css";
import "@fontsource/roboto/800.css";
import { AuthProvider } from "@/lib/auth-context";
import ThemeProvider from "@/components/ThemeProvider";
import { RealtimeProvider } from "@/lib/realtime";

export const metadata: Metadata = {
  title: "Jahed Telecom — Phone Business Manager",
  description: "Personal phone reselling business management app",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-256.png", type: "image/png", sizes: "256x256" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Jahed Telecom" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors overscroll-none">
        <ThemeProvider>
          <AuthProvider>
            <RealtimeProvider>{children}</RealtimeProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

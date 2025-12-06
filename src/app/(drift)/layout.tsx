import "@styles/globals.css";
import { Providers } from "./providers";
import Layout from "@components/layout";
import { Toasts } from "@components/toasts";
import Header from "@components/header";
import { Inter } from "next/font/google";
import { getMetadata, getViewport } from "@app-lib/metadata";
import CmdKWrapper from "@components/cmdk/cmdk-wrapper";
import clsx from "clsx";
const inter = Inter({ subsets: ["latin"], variable: "--inter-font" });

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning is required because of next-themes
    <html lang="en" className={clsx(inter.variable, "mx-auto w-(--main-content)")} suppressHydrationWarning>
      <body>
        <Toasts />
        <Providers>
          <Layout>
            <CmdKWrapper />
            <Header />
            <main>{children}</main>
          </Layout>
        </Providers>
      </body>
    </html>
  );
}

export const metadata = getMetadata();
export const viewport = getViewport();

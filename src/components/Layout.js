import Head from "next/head";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function Layout({ children, title, description }) {
  return (
    <>
      <SpeedInsights />
      <Head>
        <meta name="description" content={description} />
        <title>{title}</title>
      </Head>
      <main className={`main`}>{children}</main>
    </>
  );
}

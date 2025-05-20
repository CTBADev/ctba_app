import React from "react";
import Head from "next/head";
import { SpeedInsights } from "@vercel/speed-insights/next";
import classes from "./Layout.module.scss";

const Layout = ({
  children,
  title = "CTBL",
  description = "CTBL Homepage",
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={classes.main}>{children}</main>
      <SpeedInsights />
    </>
  );
};

export default Layout;

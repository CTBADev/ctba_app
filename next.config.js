/** @type {import('next').NextConfig} */
const contentful = require("contentful");
const nextConfig = {
  reactStrictMode: true,
  images: {
    loader: "custom",
    loaderFile: "./src/helpers/contentfulImageLoader.js",
  },
  env: {
    CONTENTFUL_SPACE_ID: process.env.CONTENTFUL_SPACE_ID,
    CONTENTFUL_ACCESS_TOKEN: process.env.CONTENTFUL_ACCESS_TOKEN,
    CONTENTFUL_MANAGEMENT_ACCESS_TOKEN:
      process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN,
  },
};

module.exports = nextConfig;

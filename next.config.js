/** @type {import('next').NextConfig} */
const contentful = require("contentful");
const nextConfig = {
  reactStrictMode: true,
  images: {
    loader: "custom",
    loaderFile: "./src/helpers/contentfulImageLoader.js",
  },
};

module.exports = nextConfig;

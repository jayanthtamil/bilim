const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/bilim",
    createProxyMiddleware({
      target: "http://210.18.176.95:8081",
      changeOrigin: false,
    })
  );
};

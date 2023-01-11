// 두 개의 다른 포트를 가지고 있는 서버는 request를 보낼 수 없는
// CORS 이슈를 가지므로 프록시 서버를 사용해 이를 해결
// 서버 : 8080
// 클라이언트 : 3000
const { createProxyMiddleware } = require("http-proxy-middleware");
module.exports = (app) => {
    app.use("/api", createProxyMiddleware({
        target: "http://localhost:8080",
        changeOrigin: true
    }));
}
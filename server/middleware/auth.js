// 페이지를 이동할 때마다 로그인이 되어 있는지에 대한 인증을 위해 사용
const { User } = require("../models/user");

let auth = (req, res, next) => {
    // 클라이언트 쿠키에서 토큰을 가져옴
    let token = req.cookies.x_auth;

    // 토큰을 복호화 한 후 유저를 찾음
    User.findByToken(token, (err, user) => {
        if(err) return err;
        if(!user) return res.json({
            isAuth: false,
            error: true
        });

        req.token = token;
        req.user = user;
        next();
    });
};

module.exports = { auth };
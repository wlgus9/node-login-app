const port = 8080;
const bodyparser = require("body-parser");
const express = require("express");
const app = express();

require('dotenv').config();

app.use(bodyparser.urlencoded({extends : true}));

const mongoose = require("mongoose");
const { User } = require("./models/user");
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser : true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false})
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

app.get("/", (req, res) => req.send("Hello World!"));

app.get("/api/hello", (req, res) => {
    res.send("안녕하세요!");
});

/* 
    * Express 미들웨어 body-parser를 사용해 post 방식으로 전송된 데이터의 body로부터 파라미터 추출 후
    * save를 사용해 DB에 저장하여 회원가입
*/
app.post("/register", (req, res) => {
    const user = new User(req.body);

    user.save((err, userinfo) => {
        if(err) return res.json({success: false, err});
        return res.status(200).json({
            success: true
        });
    })
});

const auth = require("./middlware/auth");

app.get("/api/users/auth", auth, (req, res) => {
    // 여기까지 미들웨어(auth.js)를 통과해 왔다는 건 Authentication이 True라는 것
    // 클라이언트에게 유저 정보 전달
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,  // role이 0이면 일반 유저, 그 외는 관리자
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    });
});

app.get("/api/users/logout", auth, (req, res) => {
    // 클라이언트의 토큰을 ""로 지워주게 되면 자동으로 인증이 풀리게 되어 로그아웃
    User.findOneAndUpdate({_id: req.user._id}, {token: ""}, (err, user) => {
        if(err) return res.json({success: false, err});
        return res.status(200).send({success: true});
    });
});

app.listen(port, () => console.log("Example app listening on port ${port}!"));

const port = 8080;
const bodyparser = require("body-parser");
const express = require("express");
const app = express();

app.use(bodyparser.urlencoded({extends : true}));

const mongoose = require("mongoose");
mongoose.connect(config.mongoURI, {useNewUrlParser : true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false})
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

app.get("/", (req, res) => req.send("Hello World!"));

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

app.listen(port, () => console.log("Example app listening on port ${port}!"));

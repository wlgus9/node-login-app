const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true, // 스페이스와 같은 공백을 없애주는 역할
        unique: 1   // 똑같은 이메일을 쓰지 못하도록
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: {
        type: String
    },
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
});

const User = mongoose.model("User", userSchema);
module.exports = {User};

const bcrypt = require("bcrypt");
const saltRounds = 10;

// bcrypt.genSalt => 비밀번호 암호화
userSchema.pre("save", (next) => {
    var user = this;
    if(user.isModified("password")) { // 비밀번호와 관련될 때만
        bcrypt.genSalt(saltRounds, (err, salt) => {
            if(err) return next(err);
            bcrypt.hash(user.password, salt, (err, hash) => {
                if(err) return next(err);
                user.password = hash;
                next()
            });
        });
    } else {
        next();
    }
});

const cookieParser = require("cookie-parser");
app.use(cookieParser()); // 토큰을 쿠키에 저장하기 위해 사용

app.post("/api/users/login", (req, res) => {
    // 요청된 이메일이 데이터베이스에 존재하는지 확인
    User.findOne({email: req.body.email}, (err, user) => {
        if(!user) {
            return res.json({
                loginSuccess: false,
                message: "해당 이메일에 해당하는 유저가 없습니다."
            })
        }

        // 요청된 이메일이 데이터베이스에 있다면 비밀번호 검사
        user.comparePassword(req.body.password, (err, isMatch) => {
            if(!isMatch) {
                return res.json({
                    loginSuccess: false,
                    message: "비밀번호가 틀렸습니다."
                })
            }

            // 비밀번호가 일치한다면 토큰 생성
            user.generateToken((err, user) => {
                if(err) return res.status(400).send(err);

                // 정상적일 경우 토큰을 쿠키나 로컬 스토리지에 저장
                res.cookie("x_auth", user.token)
                .status(200)
                .json({
                    loginSuccess: true,
                    userId: user._id
                })
            });
        });
    });
});

userSchema.methods.comparePassword = (plainPassword, cb) => {
    // 입력된 비밀번호와 데이터베이스에 있는 암호화 된 비밀번호가 일치하는지 확인 -> 평문을 암호화 해서 비교
    bcrypt.compare(plainPassword, this.password, (err, isMatch) => {
        if(err) return cb(err);
        cb(null, isMatch); // true
    });
};

userSchema.methods.generateToken = (cb) => {
    var user = this;

    // jwt(json web token)을 사용해서 토큰 생성
    var token = jwt.sign(user._id.toHexString(), "secretToken");
    // user._id + 'secretToken' = token을 통해 토큰 생성
    // 토큰 해석을 위해 'secretToken' 입력 -> user._id 가 나옴
    // 토큰을 가지고 누구인지 알 수 있는 것
    user.token = token;

    user.save((err, user) => {
        if(err) return cb(err);
        cb(null, user);
    });
};

userSchema.statics.findByToken = (token, cb) => {
    var user = this;

    jwt.verify(token, "secretToken", (err, decoded) => {
        // 유저 아이디를 통해 유저를 찾은 다음
        // 클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인
        user.findOne({"_id": decoded, "token": token}, (err, user) => {
            if(err) return cb(err);
            cb(null, user);
        });
    });
};
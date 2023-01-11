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
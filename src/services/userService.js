const UserLocal =require("../models/local/User")
const UsernameExists = require("../common/UsernameExists")
const cryptoPassword = require('../common/cryptoB.js');
const jwt = require('jsonwebtoken');
const UserPassword = require("../models/UserPassword");
const User = require("../models/User");
const WrongPasswordError = require("../common/WrongPasswordError");
const WrongEmailError = require("../common/WrongEmailError");
const bcrypt = require("bcrypt");
const config = require("../../config");;
;
const ObjectId = require('mongodb').ObjectID;

const maxAge = 3 * 24 * 60 * 60;

const getUser = async function (id) {
    return new Promise((resolve, reject) => {
        User.findById(ObjectId(id), function (err, result) {
            if (err) reject(err);
            resolve(result);
        })
    });
}

function checkEmailPromise(email){
    return new Promise( ((resolve, reject) => {
        User.findOne({email:email}, function(err,result) {
            if(err) reject(err);
            resolve(result);
        })
    }) );
}

const createToken = (id,isAdmin) => {
    return jwt.sign({id,isAdmin}, config.JwtSecret, {
        expiresIn: maxAge
    });
}
const saveUser = async function(email,password){
    if(await checkEmailPromise(email)==null){
        const user = await User.create({
            email
        });
        let hashPassword = await cryptoPassword(password);
        let _id = user._id
        const userPassword = await UserPassword.create({
            _id, hashPassword
        })
        const token = createToken(user._id,user.isAdmin);
        return new UserLocal(user._id,email,hashPassword,token, maxAge)
    }else{
        throw new UsernameExists('Email is registered')
    }
}

const loginUser = async function(email, password) {
    const user = await checkEmailPromise(email);
    if(user==null){
        throw new WrongEmailError();
    }
    const passwordHash = await UserPassword.findById(user._id);
    const auth = await bcrypt.compare(password, passwordHash.hashPassword);
    if (auth) {
        const token = createToken(user._id, user.isAdmin)
        return new UserLocal(user._id, email, passwordHash, token, maxAge, user.isAdmin,user.isDetails);
    } else {
        throw new WrongPasswordError();
    }
}


const changePassword = async function(email, oldPasswordInput, newPasswordInput){
    const user = await checkEmailPromise(email);
    const oldPassword = await UserPassword.findById(user._id);
    const auth = await bcrypt.compare(oldPasswordInput, oldPassword.hashPassword);
    if(auth){
        await UserPassword.updateOne({"_id": oldPassword._id},
            {$set: {"hashPassword": await cryptoPassword(newPasswordInput) }} ).then((obj) => {
            console.log('Updated - ' + obj);
        })
            .catch((err) => {
                console.log('Error: ' + err);
            })
    }else{
        throw new WrongPasswordError();
    }
}

const updateDetailUser = async function (id) {
    const user = await getUser(id);
     return await User.updateOne({
            "_id": id
        },
        {$set: {"isDetails": !user.isDetails}}
    ).then((obj) => {
        console.log('Updated - ' + obj);
    })
        .catch((err) => {
            console.log('Error: ' + err);
        })
}


const updateAdminUser = async function (id) {
    const user = await getUser(id);
    return await User.updateOne({
            "_id": id
        },
        {$set: {"isAdmin": !user.isAdmin}}
    ).then((obj) => {
        console.log('Updated - ' + obj);
    })
        .catch((err) => {
            console.log('Error: ' + err);
        })
}

const updateActiveUser = async function (id) {
    const user = await getUser(id);
    return await User.updateOne({
            "_id": id
        },
        {$set: {"isActive": !user.isActive}}
    ).then((obj) => {
        console.log('Updated - ' + obj);
    })
        .catch((err) => {
            console.log('Error: ' + err);
        })
}

module.exports = {
    saveUser: saveUser,
    loginUser: loginUser,
    getUser: getUser,
    updateDetailUser: updateDetailUser,
    updateAdminUser: updateAdminUser,
    updateActiveUser: updateActiveUser,
    changePassword: changePassword,
};

const db = require('../models');
const cookies = require('./cookies');
const Sequelize = require('sequelize');

//const variables
const COOKIE_ERROR = 'error';
const COOKIE_REGISTER = 'register';
const COOKIE_USER = 'newUser';
const COOKIE_MAX_AGE = 30 * 1000;

/**
 * enterToRegisterPage - handle the get request for the register page.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.enterToRegisterPage = (req, res) => {
    try { //display with user data
        const data = cookies.getCookieData(req, COOKIE_USER);
        renderRegister(req, res, data);
    }
    catch{ //display without user data
        renderRegister(req, res);
    }
}

/**
 * enterRegisterPasswordsPage - handle the get request for the register-passwords page.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} res - Express response object
 */
exports.getRegisterPasswordsPage = (req, res) => {

        if(cookies.isCookieExists(req, COOKIE_USER))
            renderRegisterPasswords(req, res);

        else  {
            if(cookies.isCookieExists(req, COOKIE_ERROR))
                res.cookie(COOKIE_ERROR, 'your time expired')

            res.redirect('/register');
           // renderRegister(req,res)
        }
}

/**
 * postLogin - handle the post request for the login page.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.postLoginPage = (req, res) => {
    const {password, confirmPassword} = req.body;

    if (password === confirmPassword)
        registerUser(password, req, res).then();

    else {
        res.render('register-passwords', {
            title: 'register-passwords',
            error: 'passwords do not match'});
    }
};

/**
 * enterRegisterPasswords - handle the post request for the register-passwords page.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.userBaseDataEntered = async (req, res) => {
    let {email, firstName, lastName} = req.body;

    try {
        const emailExists = await db.User.findOne({where: { email:email.toLowerCase() } });

        if (emailExists) throw new Error('Email already in use');
        else setNewUserCookie(req, res, {email, firstName, lastName});
        res.redirect("/register/register-passwords")
    }
    catch (error) {
        res.cookie(COOKIE_ERROR, error.message);
        renderRegister(req,res);
    }
};

/**
 * setNewUserCookie - sets a new user cookie with the provided data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} data - the data to be stored in the cookie
 */
const setNewUserCookie = (req, res, data) => {
    res.cookie(COOKIE_USER, JSON.stringify(data), { maxAge: COOKIE_MAX_AGE });
}

/**
 * createUser - enters a new user to the database
 * @param {String} firstName - user first name
 * @param {String} lastName - user last name
 * @param {String} email - user email
 * @param {String} password - user password
 * @param {Object} res - Express response object
 */
const createUser = async (firstName, lastName, email, password, res) => {
    try {
        await db.User.create({ firstName, lastName, email, password });
        res.cookie(COOKIE_REGISTER, "New user was registered successfully!");
        res.clearCookie(COOKIE_USER);
    }
    catch (error) {
        if (error instanceof Sequelize.ValidationError)
            throw error;
        else res.render('error', {error: error.msg});
    }
}

/**
 * registerUser - registers a new user
 * @param {string} password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const registerUser = async (password, req, res) => {
    try{
        let {email, firstName, lastName} = cookies.getCookieData(req, COOKIE_USER);
        await createUser(firstName, lastName, email, password, res);
        res.redirect('/');
    }
    catch(error){
        res.cookie(COOKIE_ERROR, error.message);
  //      res.redirect('/register');
        renderRegisterPasswords(req,res)
    }
}


//--- RENDER FUNCTIONS ----//
/**
 * renderRegister - displays the register page.
 * @param {Object} res - Express response object
 * @param {Object} req - Express response object
 * @param {User} userObj - User object
 */
function renderRegister(req, res, userObj=undefined){
    const {email, firstName, lastName} = userObj || {undefined}
    res.render('register', {
        title:'register',
        error:cookies.getCookieText(req,res,COOKIE_ERROR),
        email, firstName, lastName});
}

/**
 * renderRegisterPasswords - displays the register-passwords page.
 * @param {Object} res - Express response object
 * @param {Object} req - Express response object
 */
function renderRegisterPasswords(req, res){
    res.render('register-passwords', {
        title: 'register-passwords',
        error:cookies.getCookieText(req,res,COOKIE_ERROR)});
}


exports.errorEnter = (req, res) =>{
    res.cookie(COOKIE_ERROR, 'post to page register, unpredictable act!!')
    renderRegister(req,res);
}
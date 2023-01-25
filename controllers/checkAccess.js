exports.checkLogin = (req, res, next) => {
    if(req.session.isLoggedIn)
        next();
    else {
        if(!req.cookies.connect){
            res.render('index', {
                title: 'Login',
                error: "please sign in",
                newRegistered: ""});
        }
        else{
            text = {msg: "server is down, try again later"};
            res.status(401).json(text)
        }
    }
}

exports.checkLogout = (req,res, next) => {
    if (req.session.isLoggedIn) {
        res.redirect("/home")
    }
    else {
        next();
    }
}

exports.nocache = (req, res, next) => {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0,max-age=0,s-maxage=0');
    next();
}
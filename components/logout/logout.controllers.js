const controller = {}

controller.logout = (req,res) => {
    req.logout();
    res.redirect('/Dintair/es/Signin')
}

module.exports = controller;
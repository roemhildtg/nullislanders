exports.checkUserAuth = (req, res, next) => {
  if (req.session.username) {
    next()
  } else {
    res.redirect('/')
  }
}

var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {

    res.render('first');
});

router.get('/game/:nick', function(req, res, next){
  res.render('index', {username : req.params.nick});
})


module.exports = router;

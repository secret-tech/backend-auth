var express = require('express');
var router = express.Router();
var _ = require('underscore');
var KeyService = require('../services/KeyService');
/**
 * GET
 * 
 * Get session info
 * Used to validate JSON Web Tokens
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next) {             var sessionKey [description]
 * @return {[type]}       [description]
 */
router.get('/:sessionKey', function(req, res, next) {
  var sessionKey = req.params.sessionKey;
  if (!sessionKey) {
    return res.status(400).send({error: 'sessionKey is a required parameters'});
  }

  KeyService.get(sessionKey)
    .then(function(result) {
      if (_.isNull(result)) {
        return res.status(404).send({error: 'Session does not exist or has ' +
                                    'expired. Please sign in to continue.'});
      }
      res.status(200).send({userKey: result});
    })
    .catch(function(error) {
      console.log(error);
      next(error);
    });
});

module.exports = router;
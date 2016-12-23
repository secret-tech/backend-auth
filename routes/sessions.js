import express from 'express'

import KeyService from '../services/KeyService'

const router = express.Router()

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
router.get('/:sessionKey', async (req, res, next) => {
  try {
    const { sessionKey } = req.params

    if (!sessionKey) {
      return res.status(400).send({
        error: 'sessionKey is a required parameters'
      })
    }

    const result = await KeyService.get(sessionKey)

    return result
      ? res.status(200).send({userKey: result})
      : res.status(404).send({ error: 'Session does not exist or has expired. Please sign in to continue.'})

  } catch(e) {
    console.log(error)
    next(error)
  }
});

export default router

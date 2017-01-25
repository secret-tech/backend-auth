import { Request, Response, NextFunction } from 'express'
import keyService from '../services/key.service'

/**
 * SessionController
 */
class SessionController {

  /**
   * Return user's key
   *
   * @param  req  express req object
   * @param  res  express res object
   * @param  next express next middleware function
   */
  async view(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionKey } = req.params

      if (!sessionKey) {
        res.status(400).send({
          error: 'sessionKey is a required parameters'
        })
        return
      }

      const result = await keyService.get(sessionKey)

      result
        ? res.status(200).send({userKey: result})
        : res.status(404).send({error: 'Session does not exist or has expired. Please sign in to continue.'})
    } catch (e) {
      next(e)
    }
  }
}

export default SessionController

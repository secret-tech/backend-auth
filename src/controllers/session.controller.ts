import { Request, Response, NextFunction } from 'express'
import KeyService from '../services/KeyService'

class SessionController {
  async view(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionKey } = req.params

      if (!sessionKey) {
        res.status(400).send({
          error: 'sessionKey is a required parameters'
        })
        return
      }

      const result = await KeyService.get(sessionKey)

      result
        ? res.status(200).send({userKey: result})
        : res.status(404).send({error: 'Session does not exist or has expired. Please sign in to continue.'})
    } catch(e) {
      next(e)
    }
  }
}

export default SessionController

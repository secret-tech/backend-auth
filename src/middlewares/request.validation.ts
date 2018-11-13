import * as Joi from 'joi';
import { Response, Request, NextFunction } from 'express';

const options = {
  allowUnknown: true
};

export function createUser(req: Request, res: Response, next: NextFunction) {
  const schema = Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    login: Joi.string().required(),
    sub: Joi.string().required()
  });

  let result = Joi.validate(req.body, schema, options);

  if (result.error) {
    return res.status(422).json({...result, message: 'Validation error'});
  } else {
    return next();
  }
}

export function createTenant(req: Request, res: Response, next: NextFunction) {
  const schema = Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/)
  });

  const result = Joi.validate(req.body, schema, options);

  if (result.error) {
    return res.status(422).json({...result, message: 'Validation error'});
  } else {
    return next();
  }
}

export function loginTenant(req: Request, res: Response, next: NextFunction) {
  const schema = Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/)
  });

  const result = Joi.validate(req.body, schema, options);

  if (result.error) {
    return res.status(422).json({...result, message: 'Validation error'});
  } else {
    return next();
  }
}

export function createToken(req: Request, res: Response, next: NextFunction) {
  const schema = Joi.object().keys({
    login: Joi.string().required(),
    password: Joi.string().required(),
    deviceId: Joi.string().required()
  });

  const result = Joi.validate(req.body, schema, options);

  if (result.error) {
    return res.status(422).json({...result, message: 'Validation error'});
  } else {
    return next();
  }
}

export function tokenRequired(req: Request, res: Response, next: NextFunction) {
  const schema = Joi.object().keys({
    token: Joi.string().required()
  });

  const result = Joi.validate(req.body, schema, options);

  if (result.error) {
    return res.status(422).json({...result, message: 'Token is missing'});
  } else {
    return next();
  }
}

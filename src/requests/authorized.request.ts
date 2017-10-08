import { Request } from 'express';

export interface AuthorizedRequest extends Request {
  tenant?: any;
}

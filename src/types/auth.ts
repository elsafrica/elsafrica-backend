import { JwtFromRequestFunction } from 'passport-jwt';

export type Options = {
  jwtFromRequest: JwtFromRequestFunction,
  secretOrKey: string
};

export type JWTPAYLOAD = {
  id: string,
  username: string,
  userType: string;
};
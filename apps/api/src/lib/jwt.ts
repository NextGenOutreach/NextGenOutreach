import jwt, { SignOptions } from 'jsonwebtoken';
import { JWTPayload } from '@nextgenoutreach/types';

export function signAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  const options: SignOptions = { 
    algorithm: 'RS256', 
    expiresIn: '15m',
    issuer: 'nextgen-outreach',
    audience: 'nextgen-outreach-users'
  };
  return jwt.sign(payload, process.env.JWT_PRIVATE_KEY!, options);
}

export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, process.env.JWT_PUBLIC_KEY!, { 
    algorithms: ['RS256'],
    issuer: 'nextgen-outreach',
    audience: 'nextgen-outreach-users'
  }) as JWTPayload;
}

export function signRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  const options: SignOptions = { 
    algorithm: 'RS256', 
    expiresIn: '7d',
    issuer: 'nextgen-outreach',
    audience: 'nextgen-outreach-users'
  };
  return jwt.sign(payload, process.env.JWT_PRIVATE_KEY!, options);
}

export function verifyRefreshToken(token: string): JWTPayload {
  return jwt.verify(token, process.env.JWT_PUBLIC_KEY!, { 
    algorithms: ['RS256'],
    issuer: 'nextgen-outreach',
    audience: 'nextgen-outreach-users'
  }) as JWTPayload;
}

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const hashPassword = (password: string) => bcrypt.hash(password, 10);
export const comparePassword = (password: string, hash: string) => bcrypt.compare(password, hash);

export const signAccess = (userId: string, role: string) => jwt.sign({ sub: userId, role }, env.jwtAccessSecret, { expiresIn: '15m' });
export const signRefresh = (userId: string) => jwt.sign({ sub: userId }, env.jwtRefreshSecret, { expiresIn: '7d' });

export const verifyAccess = (token: string) => jwt.verify(token, env.jwtAccessSecret) as { sub: string; role: string };
export const verifyRefresh = (token: string) => jwt.verify(token, env.jwtRefreshSecret) as { sub: string };

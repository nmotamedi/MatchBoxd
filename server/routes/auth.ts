import express from 'express';
import { ClientError } from '../lib';
import { Auth, User, db } from '../server';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

export const router = express.Router();

const hashKey = process.env.TOKEN_SECRET;
if (!hashKey) throw new Error('TOKEN_SECRET not found in .env');

router.post('/sign-up', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      throw new ClientError(400, 'Username and password are required');
    }
    const hashedPassword = await argon2.hash(password);
    const sql = `
    insert into "users"("username", "hashedPassword")
      values ($1, $2)
      returning "username", "userId";
    `;
    const params = [username, hashedPassword];
    const resp = await db.query<User>(sql, params);
    const [row] = resp.rows;
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
});

router.post('/sign-in', async (req, res, next) => {
  try {
    const { username, password } = req.body as Partial<Auth>;
    if (!username || !password) {
      throw new ClientError(400, 'Username and password are required');
    }
    const sql = `
    select "userId", "hashedPassword"
      from "users"
      where "username" = $1;
    `;
    const param = [username];
    const userResp = await db.query(sql, param);
    const [userInfo] = userResp.rows;
    if (!userInfo) throw new ClientError(401, 'Invalid Login');
    const verify = await argon2.verify(userInfo.hashedPassword, password);
    if (!verify) throw new ClientError(401, 'Invalid Login');
    const userPayload = { userId: userInfo.userId, username };
    const signedToken = jwt.sign(userPayload, hashKey);
    res.json({ user: userPayload, token: signedToken });
  } catch (err) {
    next(err);
  }
});

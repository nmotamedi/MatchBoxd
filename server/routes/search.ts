import express from 'express';
import { ClientError } from '../lib';
import { FilmDetails, FilmQueryResults, db, tmdbOptions } from '../server';

export const router = express.Router();

router.get(`/:query`, async (req, res, next) => {
  try {
    const { query } = req.params;
    if (query === '') throw new ClientError(400, 'Query is required');
    const sql = `
      select "username", "userId"
        from "users"
        where lower("username") like $1;
      `;
    const userQueryResp = await db.query(sql, [`%${query}%`]);
    const userResults = userQueryResp.rows;
    const filmQueryResp = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${query}&include_adult=false&language=en-US&page=1`,
      tmdbOptions
    );
    if (!filmQueryResp.ok) throw new Error('Unable to fetch films');
    const filmJSON = (await filmQueryResp.json()) as FilmQueryResults;
    const filmResults = filmJSON.results as FilmDetails[];
    res.json({ userResults, filmResults });
  } catch (err) {
    next(err);
  }
});

# MatchBoxd

A full stack JavaScript application for film watchers who want to find recommendations from users with similar taste.

## Why I Built This

As an avid film fan, I constantly give recommendations to my friends and family. However, since our tastes are different, they don't always love my recommendations. 8 years ago I thought up this idea to find other people whose taste may better match those I love.

## Technologies Used

- React.js
- Node.js
- Typescript
- Express
- PostgreSQL
- HTML
- CSS
- TMDb API (https://developer.themoviedb.org/docs/getting-started)
  -Calculate-Correlation NPM Package (https://www.npmjs.com/package/calculate-correlation)

## Live Demo

Try the application live at [http://matchboxd-dev.us-west-1.elasticbeanstalk.com/](http://matchboxd-dev.us-west-1.elasticbeanstalk.com/)

## Features

- User can log into their account.
- User can see 6 popular movies on the main page.
- User can see their following’s recent activity.
- User can view details on movies (synopsis, cast, crew).
- User can add movies they have seen to their film log with a rating, binary like, and/or a review.
- User can view their own prior activity with the movie if any.
- User can edit an individual film log.
- User can delete an individual film log.
- User can search for movies to see details for.
- User can search for users to follow.
- User can add films to a wishlist.
- User can view their own profile with their film log, film wishlist, and recent reviews.
- User can follow other users and view their profiles (ratings, reviews, watchlist, etc).
- User can find their most compatible user within users they follow.
- User can find their most compatible user among all site accounts.
- User can see recommendations from their most compatible user - the 4 highest rated films from the comparison user that the activeUser has not already seen.

## Preview

[MatchBoxd Walkthrough]: (/assets/matchboxd_walkthrough.gif)

## Stretch Features

- User can log any movie multiple times.
- User can view any of their following’s activity with movies if any.
- User gets notified when they are being followed.

## Development

### System Requirements

- Node.js v20.12.2 or higher
- NPM 10.5.0 or higher
- PostgresQL ??
- Calculate-correlation 1.2.3
- Node Fetch 3.3.2
- react-fontawesome: 1.7.1
- react-icons: 5.1.0
- react-router-dom: 6.22.3
- tsx: 4.7.0
- typescript: 5.1.6

### Getting Started

1. Clone the repository.

   ```shell
   git clone https://github.com/nmotamedi/MatchBoxd.git
   ```

2. Install all dependencies with NPM.

   ```shell
   npm install
   ```

3. Start Database.

   ```shell
   sudo service postgresql start
   ```

4. Import the example database to PostgreSQL.

   ```shell
   npm run db:import
   ```

5. Start the project. Once started you can view the application by opening http://localhost:5173 in your browser.

   ```shell
   npm run dev
   ```

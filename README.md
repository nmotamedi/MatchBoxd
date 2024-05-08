````md
# student-grade-table

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

!!!!!GIF!!!!!

## Stretch Features

- User can log any movie multiple times.
- User can view any of their following’s activity with movies if any.
- User gets notified when they are being followed.

## Development

### System Requirements

- Node.js 10 or higher
- NPM 6 or higher
- MongoDB 4 or higher

### Getting Started

1. Clone the repository.

   ```shell
   git clone https://github.com/Learning-Fuze/sgt-react
   cd sgt-react
   ```

1. Install all dependencies with NPM.

   ```shell
   npm install
   ```

1. Import the example database to MongoDB.

   ```shell
   mongoimport --db sgt-react database/dump.json
   ```

1. Start the project. Once started you can view the application by opening http://localhost:3000 in your browser.

   ```shell
   npm run dev
   ```
````

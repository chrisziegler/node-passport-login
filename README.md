# node-passport-login

To use cloned repo need to add root level .env with

    SESSION_SECRET=<YourSessionSecret>

npm install

npm run devStart

Here’s what it does:

- Renders an index page
- Allows users to log in, using Bcrypt to check passwords
- Allows users to create an account
- Allows users to log out.

Here’s what it doesn’t do:

- Logging in with Google, Auth0, Facebook, Twitter etc. If you want to do that, check out the [Passport.js strategies page](http://www.passportjs.org/packages/).

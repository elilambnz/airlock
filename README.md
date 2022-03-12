![Airlock Logo](/.github/logo.png?raw=true)

A [SpaceTraders API](https://spacetraders.io/) web app made with React by [elilambnz](https://github.com/elilambnz)

## Screenshots

![Airlock Screenshot](/.github/screenshot-1.png?raw=true)

![Airlock Screenshot](/.github/screenshot-2.png?raw=true)

![Airlock Screenshot](/.github/screenshot-3.png?raw=true)

## Getting Started

The app is hosted at https://airlock.elilamb.nz or you can run the frontend locally with a few simple steps:

1. Clone this repo
2. Copy the env file template

   ```
   cp .env.template .env.local
   ```

3. Install the dependencies

   ```
   npm i
   ```

4. Start the development server

   ```
   npm start
   ```

5. Navigate to http://localhost:3000 in your browser

## Auxiliary API

You may notice references to an "auxiliary API" throughout the app. This is an API used to store the user's automation routes in production. You could either create your own service or persist these to browser storage.

The code for this API is not currently included in this repo.

## License

This project is open source software [licensed as MIT](https://github.com/elilambnz/airlock/blob/main/LICENSE.md).

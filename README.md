
## Play the game!
https://court-of-worms.vercel.app/

## To run app:

npm install
npm run dev

## Realtime gameplay

The SvelteKit app can be deployed to Vercel, but multiplayer rooms run in the
separate PartyServer Worker. Start it locally with
`npm --prefix party-worker run dev`. In production, deploy the Worker with
`npm --prefix party-worker run deploy` and set the Vercel environment variable
`VITE_PARTY_SERVER_HOST` to its public URL (for example,
`https://your-worker.workers.dev`). The app uses `localhost:8787` as a
development-only default.

Each room starts with a pre-trial where three players submit 9 word prompts
each. The game assigns courtroom roles and begins the trial after all three
submissions arrive.

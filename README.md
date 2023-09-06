# Porch Reads Club

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Backend tests status](https://img.shields.io/github/actions/workflow/status/mai-soup/porch-reads-club/pr-backend.yml?label=Backend%20tests)
![Frontend tests status](https://img.shields.io/github/actions/workflow/status/mai-soup/porch-reads-club/pr-frontend.yml?label=Frontend%20tests)
<!-- TODO: add badges for test coverage -->

A MEVN stack application to help anyone manage their own little library online - manage inventory, members, loans.

## Accessing the app online

A hosted production version is available at https://porchreads.club/.

## Setting up locally for development

> **Note:**
> The guide assumes you have Docker and Docker Compose installed locally. If not, refer to the [Docker documentation](https://docs.docker.com/compose/install/) for installation instructions.

To run the app with default settings (Mongo database as a service in the container):

```bash
docker compose up
```

This will start up the necessary Docker containers - the backend Node.js app, the MongoDB database, and the frontend Vue.js app.

The backend API will be available at http://localhost:3000 and the frontend at http://localhost:5173.

If you don't care for the Mongo logs (since there's a _lot_ of them), you can run the mongo service in the background first:

```bash
docker compose up -d mongo
docker compose up api frontend
```

### Customising the environment

If you want to configure your containers differently, e.g. using your own MongoDB instance instead of the containerized one, create a `.env` file in the backend and frontend directories with the appropriate values. There is a `.env.example` provided with the default values. If you wish to leave some of the variables at their default values, just omit them from the `.env` file.

If using your own MongoDB instance, there is no need to run the mongo service, so you can run the app with:

```bash
docker compose up api frontend
```

> **Note**: in dev environment, the app uses live reload for changes inside the `src` directory in both the frontend and backend. Any changes to files outside of `src`, e.g. package installations, will require a rebuild of the respective containers.

### OpenAI API key

The app uses OpenAI's API for generating enhanced library descriptions. If you wish to work with the description generation feature, you will need to obtain your own API key from OpenAI and provide it as an environment variable. The default value is just for demo purposes and is not a real, working key.

## MIT License

Project: Copyright (c) 2023 Maijs Garais

Node template: Copyright (c) 2023 Coyotiv

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

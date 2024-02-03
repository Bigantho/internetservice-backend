import express from "express";
import {createServer} from "node:http";
import cors from 'cors';
import corsConfig from './cors.mjs';
// import passport from 'passport';

class Server {
  constructor() {
    this.app    = express();
    this.server = createServer(this.app);
    this.port   = process.env.PORT || "3000";
    this.host   = process.env.HOST || "localhost";
    this.middlewares();
  }

  start() {
    this.server.listen(this.port, this.host, () => {
      // eslint-disable-next-line no-console
      console.log(`http://${this.host}:${this.port}`);
    });
  }

  middlewares() {
    this.app.use(cors(corsConfig));
    this.app.use(express.json());
    this.app.use(express.urlencoded({extended: true}));
    // this.app.use(passport.initialize());
  }
}

export default new Server();
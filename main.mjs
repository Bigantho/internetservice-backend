import server from "./config/server.mjs";
import mainRouter from "./routes/mainRouter.mjs"
import mainRouterView from "./routes/mainRouterView.mjs"
import * as http2 from "node:http2"
import  express  from "express";

// IMPORTANT: Import to force initialization of associations. DO NOT REMOVE!
// import models from "./models/index.mjs";

export default class Main {
  constructor() {
    this.server = server;
    this.server.start();

    this.server.app.set('views', './views')
    this.server.app.set('view engine', 'ejs')
    this.server.app.use(express.static('public'));


    this.routes();
  }

  routes() {
    this.server.app.use('/test', (req, res) => {
      const errorMsg = 'Resource route not found';

      res.status(http2.constants.HTTP_STATUS_NOT_FOUND)
        .json({'message': "test aneter"});

      // console.log(`${errorMsg}: `, req.url);
    });

    this.server.app.use('/api/v1', mainRouter);
    this.server.app.use('/', mainRouterView);

    this.server.app.all('*', (req, res) => {
      const errorMsg = 'Resource route not found';

      res.status(http2.constants.HTTP_STATUS_NOT_FOUND)
        .json({'message': errorMsg});

      console.log(`${errorMsg}: `, req.url);
    });
  }
}
import {constants} from "node:http2";

const corsConfig = {
  origin:               '*',
  methods:              'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue:    false,
  optionsSuccessStatus: constants.HTTP_STATUS_NO_CONTENT,
};

export default corsConfig;
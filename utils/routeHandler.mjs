import {validationResult, Result} from "express-validator";
import {constants} from "node:http2";

const handleRequestWithValidation = function (controllerRouteCallback) {
  return (req, res) => {
    /** @param {Result} error */
    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      return controllerRouteCallback(req, res);
    }
    
    const errorMessages = errors.array({onlyFirstError: true})
      .map(error => {
        return { field: error.path, error: error.msg};
      });
  
    return res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
      mainError:  'Data provided is not valid',
      errors:     errorMessages,
    });
  };
};

export default handleRequestWithValidation;
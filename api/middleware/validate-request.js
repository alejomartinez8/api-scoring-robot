module.exports = validateRequest;

/******************************************************************************
 * @desc  Validate fields in request
 * @param {*} req
 * @param {*} next
 * @param {*} schema
 */
function validateRequest(req, next, schema) {
  const options = {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknow props
    stripUnknown: true // remove unknow props
  };

  const { error, value } = schema.validate(req.body, options);

  if (error) {
    next(
      `Validation error: ${error.details.map((elm) => elm.message).join(', ')}`
    );
  } else {
    req.body = value;
    next();
  }
}

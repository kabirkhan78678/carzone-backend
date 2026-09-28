// Response handler utility functions with language support

const sendResponse = (res, success, statusCode, message, data = null, language = 'en') => {
  return res.status(statusCode).json({
    success: success,
    status: statusCode,
    language: language,
    message: message,
    data: data || undefined,
  });
};

// General error handling function
const handleError = (res, statusCode, message, language = 'en') => {
  return sendResponse(res, false, statusCode, message, null, language);
};

// Success handler function
const handleSuccess = (res, statusCode, message, data = null, language = 'en') => {
  console.log(data)
  return sendResponse(res, true, statusCode, message, data, language);
};

export const handleSuccessNew = (res, status, message, data = {}) => {
    return res.status(status).json({
        success: true,
        status,
        language: res.locals.language || "en",
        message,
        ...data, // <-- Spread the object instead of nesting it
    });
};

// Validation error handler
const vallidationErrorHandle = (res, error, language = 'en') => {
  let errorMessage = 'Validation error';
  if (error && typeof error.array === 'function') {
    const arr = error.array();
    if (arr.length > 0) errorMessage = arr[0].msg;
  } else if (error && Array.isArray(error.errors) && error.errors.length > 0) {
    errorMessage = error.errors[0].msg;
  }
  return sendResponse(res, false, 400, errorMessage, null, language);
};

const joiErrorHandle = (res, error, language = 'en') => {
  return res.status(200).send({
    success: false,
    status: 400,
    language: language,
    message: error.details[0].message
  });
};

// Export the functions for reuse
export { handleError, handleSuccess, vallidationErrorHandle, joiErrorHandle };
 // send success response
  const success = async (res, message, data=[]) => {
    res.writeHead(200, {
      'Content-Type': 'application/json'
    });
    res.write(JSON.stringify({
      statusCode: 200,
      data: data,
      message: message,
      statusMessage: 'success'
    }));
    res.end();
  };
  
  // send error response
  const error = async (res, message, statusCode = 400, data = []) => {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json'
    });
    res.write(JSON.stringify({
      statusCode: statusCode,
      data: data,
      message: message,
      statusMessage: 'error'
    }));
    res.end();
  };
  
  module.exports.successResponse = success;
  module.exports.errorResponse = error;
  
  
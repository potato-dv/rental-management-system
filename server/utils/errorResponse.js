const isProduction = process.env.NODE_ENV === "production";

const getErrorMessage = (error) => {
  if (isProduction) {
    return "Internal Server Error";
  }
  return error?.message || "Internal Server Error";
};

const sendServerError = (res, error) => {
  return res.status(500).json({
    success: false,
    message: getErrorMessage(error),
  });
};

module.exports = { sendServerError };

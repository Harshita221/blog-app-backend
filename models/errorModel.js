class HttpError extends Error {
    constructor(message, errorCode) {
      super(message); // Call the parent class constructor (Error)
      
      if (typeof errorCode !== "number") {
        throw new Error("Error code must be a number");
      }
  
      this.code = errorCode; // Assign the error code to the instance
    }
  }
  
  module.exports = HttpError;
  
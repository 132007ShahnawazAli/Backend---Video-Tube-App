class ApiResponse {
  constructor(statusCode, message, data = "sucess") {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = statusCode<400;
    this.errors = errors;
  }
}

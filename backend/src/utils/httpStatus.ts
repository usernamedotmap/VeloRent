// Named HTTP status codes
// Use these everywhere instead of magic numbers
// e.g. res.status(HttpStatus.OK) instead of res.status(200)

export const HttpStatus = {
  // 2xx Success
  OK:         200,
  CREATED:    201,
  NO_CONTENT: 204,

  // 4xx Client errors
  BAD_REQUEST:  400,
  UNAUTHORIZED: 401,
  FORBIDDEN:    403,
  NOT_FOUND:    404,
  CONFLICT:     409,
  UNPROCESSABLE: 422,
  TOO_MANY:     429,

  // 5xx Server errors
  INTERNAL: 500,
} as const;

export type HttpStatusCode = typeof HttpStatus[keyof typeof HttpStatus];
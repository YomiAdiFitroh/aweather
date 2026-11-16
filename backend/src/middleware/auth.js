const { verifyAccessToken } = require('../utils/tokens');
const { HttpError } = require('../utils/httpError');

// JWT guard: protects any route it is attached to.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new HttpError(401, 'Missing access token'));
  }

  try {
    req.userId = verifyAccessToken(token).sub;
    return next();
  } catch {
    return next(new HttpError(401, 'Invalid or expired access token'));
  }
}

module.exports = { requireAuth };

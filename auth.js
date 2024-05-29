const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    res.writeHead(401, { 'WWW-Authenticate': 'Basic' });
    res.end('Authentication required');
    return;
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  if (username === 'admin' && password === 'password') {
    next();
  } else {
    res.writeHead(401, { 'WWW-Authenticate': 'Basic' });
    res.end('Authentication required');
  }
};

module.exports = { authenticate };

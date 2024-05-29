const http = require('http');
const fs = require('fs');
const path = require('path');
const { parse } = require('querystring');
const { authenticate } = require('./auth');

const usersFile = path.join(__dirname, 'users.json');
const memoriesFile = path.join(__dirname, 'memories.json');

// Initialize files if they don't exist
if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, JSON.stringify([]));
}
if (!fs.existsSync(memoriesFile)) {
  fs.writeFileSync(memoriesFile, JSON.stringify([]));
}

const handleRequest = (req, res) => {
  if (req.method === 'POST' && req.url === '/signup') {
    handleSignup(req, res);
  } else if (req.method === 'POST' && req.url === '/login') {
    handleLogin(req, res);
  } else {
    authenticate(req, res, () => {
      if (req.method === 'POST' && req.url === '/memories') {
        handleCreateMemory(req, res);
      } else if (req.method === 'GET' && req.url === '/memories') {
        handleGetMemories(req, res);
      } else {
        res.statusCode = 404;
        res.end('Not Found');
      }
    });
  }
};

const handleSignup = (req, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    const { username, email, password } = parse(body);
    const usersFile = path.join(__dirname, 'users.json');
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));

    const userExists = users.find(user => user.email === email);
    if (userExists) {
      res.statusCode = 400;
      res.end('User already exists');
      return;
    }

    users.push({ username, email, password });
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

    res.statusCode = 201;
    res.end('User created');
  });
};

const handleLogin = (req, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    const { email, password } = parse(body);
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));

    const user = users.find(user => user.email === email && user.password === password);
    if (!user) {
      res.statusCode = 400;
      res.end('Invalid credentials');
      return;
    }

    res.end(JSON.stringify({ message: 'Login successful' }));
  });
};

const handleCreateMemory = (req, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    const { content } = parse(body);

    const memories = JSON.parse(fs.readFileSync(memoriesFile, 'utf8'));
    const newMemory = { id: generateMemoryId(), content };
    memories.push(newMemory);
    fs.writeFileSync(memoriesFile, JSON.stringify(memories, null, 2));

    res.statusCode = 201;
    res.end(JSON.stringify(newMemory));
  });
};

const handleGetMemories = (req, res) => {
  const memories = JSON.parse(fs.readFileSync(memoriesFile, 'utf8'));
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(memories));
};

const generateMemoryId = () => {
  const memories = JSON.parse(fs.readFileSync(memoriesFile, 'utf8'));
  return memories.length + 1;
};

const server = http.createServer(handleRequest);

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

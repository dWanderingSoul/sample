const http = require('http');
const fs = require('fs');

// Define the memory data file path
const memoryFilePath = 'memories.json';

// Function to read memories from the JSON file
function getMemories() {
  try {
    const data = fs.readFileSync(memoryFilePath, 'utf8');
    return JSON.parse(data) || []; // Return empty array if file is empty
  } catch (err) {
    console.error('Error reading memories:', err);
    return []; // Return empty array on error
  }
}

// Function to write memories to the JSON file
function saveMemories(memories) {
  try {
    fs.writeFileSync(memoryFilePath, JSON.stringify(memories, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving memories:', err);
  }
}

// Function to create a new memory
function createMemory(content) {
  return {
    id: Math.random().toString(36).substring(2, 15), // Generate random ID
    content,
  };
}

// Function to handle authentication errors (helper function)
function handleAuthError(res) {
  res.writeHead(401, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Authentication required' }));
}

// Function to handle requests and responses
function handleRequest(req, res) {
  // Authenticate using the middleware function from auth.js
  if (!authenticate(req)) {
    handleAuthError(res);
    return;
  }

  const parsedUrl = url.parse(req.url, true); // Parse URL for query parameters
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle memories (assuming content is in request body)
  if (pathname === '/memories') {
    if (method === 'GET') {
      const memories = getMemories();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ memories }));
    } else if (method === 'POST') {
      let content;
      try {
        content = JSON.parse(req.body).content; // Assuming content is in JSON format
      } catch (err) {
        console.error('Error parsing memory content:', err);
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid memory content format');
        return;
      }
      const memories = getMemories();
      memories.push(createMemory(content));
      saveMemories(memories);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Memory created successfully!' }));
    } else {
      res.writeHead(405, { 'Content-Type': 'text/plain' });
      res.end('Method not allowed');
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
}

// HTTP server and listen on a port
const server = http.createServer(handleRequest);
const port = process.env.PORT || 3001;
server.listen(port, () => console.log(`Server listening on port ${port}`));


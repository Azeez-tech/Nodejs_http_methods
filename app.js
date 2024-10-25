const fs = require('fs');
const path = require('path');
const http = require('http');
const { error } = require('console');
const HOSTNAME = 'localhost';
const PORT = 5000;

const booksFile = path.join(__dirname, 'books', 'books.json');

const server = http.createServer(requestHandler);

function requestHandler (req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.url === '/' && req.method === 'GET') {
    getAllBooks(req, res);
} else if (req.url === '/books' && req.method === 'POST') {
  addBook(req, res);
} else if (req.url === '/books' && req.method === 'PUT') {
  updateBook(req, res);
} else if (req.url === '/books' && req.method === 'DELETE') {
  deleteBook(req, res);
} else {
  res.writeHead(404);
  res.end(JSON.stringify('Invalid URL!'));
  return;
}
}

function getAllBooks (req, res) {
  fs.readFile(booksFile, 'utf8', (error, books) => {
    if (error) {
      res.writeHead(500);
      res.end(JSON.stringify('Server error'));
      return;
    }
    res.writeHead(200);
    res.end(books);
  })
}

function addBook (req, res) {
  const body = [];
  req.on('data', (chunk) => {
    body.push(chunk);
  });
  req.on('end', () => {
    const parsedBody = Buffer.concat(body).toString();
    const newBook = JSON.parse(parsedBody);

    fs.readFile(booksFile, 'utf8', (error, books) => {
      if (error) {
        res.writeHead(500);
      res.end(JSON.stringify('Server error'));
      return;
      }
      const oldBooks = JSON.parse(books);
      const allBooks = [...oldBooks, newBook];
      const lastBook = oldBooks[oldBooks.length - 1];
      const lastBookId = lastBook.id;
      newBook.id = lastBookId + 1;

      fs.writeFile(booksFile, JSON.stringify(allBooks), (error) => {
        if (error) {
          res.writeHead(500);
          res.end(JSON.stringify('Server error'));
          return;
        }
        res.writeHead(200);
        res.end(JSON.stringify('Books Added Successfully'));
      });
    });
  });
}

function updateBook (req, res) {
  const body = [];

  req.on('data', (chunk) => {
    body.push(chunk);
  })
  req.on('end', () => {
    const parsedBody = Buffer.concat(body).toString();
    const bookToUpdate = JSON.parse(parsedBody);

    fs.readFile(booksFile, 'utf8', (error, books) => {
      if (error) {
        res.writeHead(500);
          res.end(JSON.stringify('Server error'));
          return;
      }
      const allBooks = JSON.parse(books);
      const booksIndex = allBooks.findIndex(book => book.id === bookToUpdate.id);
      if (booksIndex === -1) {
        res.writeHead(404);
        res.end(JSON.stringify('No Book Found with the specified ID'));
        return;
      }
      allBooks[booksIndex] = {...allBooks[booksIndex], ...bookToUpdate};
      fs.writeFile(booksFile, JSON.stringify(allBooks), (error) => {
        if (error) {
          res.writeHead(500);
          res.end(JSON.stringify('Server error'));
          return;
        }
        res.writeHead(200);
        res.end(JSON.stringify('Book Updated Successfully'));
      });
    });
  });
}

function deleteBook (req, res) {
  const body = [];

  req.on('data', (chunk) => {
    body.push(chunk);
  });
  req.on('end', () => {
    const parsedBody = Buffer.concat(body).toString();
    const bookToDelete = JSON.parse(parsedBody);

    fs.readFile(booksFile, 'utf8', (error, books) => {
      if (error) {
        res.writeHead(500);
          res.end(JSON.stringify('Server error'));
          return;
      }
      const allBooks = JSON.parse(books);
      const booksIndex = allBooks.findIndex(book => book.id === bookToDelete.id);
      if (booksIndex === - 1) {
        res.writeHead(404);
        res.end(JSON.stringify('No Book Found with the id you specified'));
        return;
      }
      allBooks.splice(booksIndex, 1);

      fs.writeFile(booksFile, JSON.stringify(allBooks), (error) => {
        if (error) {
          res.writeHead(500);
          res.end(JSON.stringify('Server error'));
          return;
        }
        res.writeHead(200);
        res.end(JSON.stringify('Book Deleted Successfully'));
      });
    });
  });
}

server.listen(PORT, HOSTNAME, () => {
  console.log(`Server is listening at http://${HOSTNAME}:${PORT}`);
  
});
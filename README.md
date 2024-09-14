# Chattiest User API

Backend repository for chattiest user single-page application. Built using NodeJS and Express to serve API endpoint.

Multer is also utilized for enable the API to take in files from the client-side.

## Navigating the Repository

Function code is defined in `index.js`.

File paths are saved in `uploads` but they are not currently persistent as we unlink them each time the function code has ran.

## Testing the API

First run `npm i` to install the dependencies and libraries used.

- Testing via Postman
1. Run `node index.js` to run the Express server. 
2. Choose `POST` method with URL as `http://localhost:3001/process-chat-logs`.
3. Upload .txt files into Body > form-data.
4. Name key as `chatlog` true to the way function code was written. 

- Testing via unit test script

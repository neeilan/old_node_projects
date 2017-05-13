# imgsearch
A XHR abstraction layer that lets users search a custom Google image search engine in this case, without exposing the API key. The key is saved in the apikey.txt file in the main directory, which is read at runtime (you need to create this file containing a key before running). The application features simple form validation on both the client and server side (for query ranges and empty requests).


In addition, queries are stored using MongoDB, with the user being able to view the last five searches. Create a "recent" directory and run MongoDB on port 27017 (mongod --port 27017 --dbpath=./recent) at runtime. 

[View on Heroku.] (https://neeilimg.herokuapp.com/)

.. highlight:: rst

Idris, a Research Intelligence platform
=========================================

This is a work-in-progress, research project from Erasmus University Library Rotterdam.

Setting up Idris-Client
-------------------------

* Install npm
* Clone the repository, install dependencies::

    git clone https://github.com/jascoul/idris-client.git
    npm install

Running the Client
------------------

You can start the client using::

    npm start

Create a build with::

    npm run-script build

Note that there are no further dependencies on Node.js, the resulting javascript is pure client side.

Running the Backend API
-----------------------

The client connects to the Idris backend API: https://github.com/jascoul/idris-pub/api


* Start the development webserver::

    pserve idris.ini

* Visit the API browser at http://localhost:6543/api/swagger.html

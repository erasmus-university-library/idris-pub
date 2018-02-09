.. highlight:: rst

Caleido, a Research Intelligence platform
=========================================

.. image:: https://travis-ci.org/jascoul/caleido-client.svg?branch=master
    :target: https://travis-ci.org/jascoul/caleido-client

This is a work-in-progress, research project from Erasmus University Library Rotterdam.

Setting up Caleido-Client
-------------------------

* Install npm
* Clone the repository, install dependencies::

    git clone https://github.com/jascoul/caleido-client.git
    npm install

Running the Client
------------------

You can start the client using::

    npm start

Note that there are no further dependencies on Node.js, the resulting javascript is pure client side.

Running the Backend API
-----------------------

The client connects to the Caleido backend API

* Start the development webserver::

    pserve caleido.ini

* Visit the API browser at http://localhost:6543/api/swagger.html


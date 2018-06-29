.. highlight:: rst

Idris, a Research Intelligence platform
=========================================

.. image:: https://travis-ci.org/jascoul/idris-pub.svg?branch=master
    :target: https://travis-ci.org/jascoul/idris-pub

This is a work-in-progress, research project from Erasmus University Library Rotterdam.

Setting up Idris API
--------------------

* Install Python3.4 or newer
* Install PostgreSQL 9.5 or newer
* Clone the repository, create a virtualenv, install dependencies::

    git clone https://github.com/jascoul/idris.git
    cd idris/api
    virtualenv --python=python3 .
    source bin/activate
    pip install -e .

* Create a PostgreSQL database with the same user/password as the idris.ini file (Have a look at the psql commands in the travis.yaml file)
* Initialize the database with the initialize_db script::

    initialize_db idris.ini

Tests
-----

* Install dependencies::

    pip install tox pytest webtest

* Run the unittests::

    pytest tests

Starting the API server
-----------------------

* Start the development webserver::

    gunicorn --paste idris.ini

* Visit the API browser at http://localhost:6543/api/swagger.html

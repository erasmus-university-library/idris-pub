.. highlight:: rst

Idris, a Research Intelligence platform
=========================================

.. image:: https://travis-ci.org/erasmus-university-library/idris-pub.svg?branch=master
    :target: https://travis-ci.org/erasmus-university-library/idris-pub

.. image:: https://codecov.io/gh/erasmus-university-library/idris-pub/branch/master/graph/badge.svg
    :target: https://codecov.io/gh/erasmus-university-library/idris-pub

Idris is a repository platform for storing research output and publications. The platform provides a well documented API layer that can be used to build applications on top of. Current / planned applications include:

* A metadata editor (encompassing the whole Idris data model)
* A learning material repository (providing royalty management, learning analytics and deep LTI integration)
* A reporting / dashboard frontend (for Research Intelligence purposes, utilizing Google BigQuery)
* An institutional repository frontend (storing academic output and student theses)
* A journal website frontend

The software is multi-tenant, allowing many repositories to be hosted alongside each other, with the possibility of importing, merging and comparing between repositories. Integrations are planned with several bibliographic data providers.

This is a work-in-progress, research project from Erasmus University Library Rotterdam.

Setting up Idris API
--------------------

* Install Python 3.4 or newer
* Install PostgreSQL 9.5 or newer
* Install Redis 4.0 or newer
* Clone the repository, create a virtualenv, install dependencies::

    git clone https://github.com/jascoul/idris.git
    cd idris/api
    virtualenv --python=python3 .
    source bin/activate
    pip install -e .

* Create a PostgreSQL database with the same user/password as the idris-dev.ini
file (Have a look at the psql commands in the travis.yaml file)::

  pg_config
  psql -c 'CREATE DATABASE idris;' -U postgres
  psql -c "CREATE USER idris WITH PASSWORD '<password>'" -U postgres
  psql -c 'GRANT ALL PRIVILEGES ON DATABASE idris to idris' -U postgres
  psql idris -c 'CREATE EXTENSION ltree' -U postgres

* Initialize the database with the initialize_db script::

    initialize_db idris-dev.ini

Tests
-----

* Install dependencies::

    pip install tox pytest webtest

* Run the unittests::

    pytest tests

Starting the API server
-----------------------

* Start the development webserver::

    gunicorn --paste idris-dev.ini

* Visit the API browser at http://localhost:6543/api/

Building the Editor Client
--------------------------

* Go to the web directory, install dependencies, build a distributable version::

    cd web
    npm install
    npm run-script build

* Visit the Editor client at http://localhost:6543/edit/

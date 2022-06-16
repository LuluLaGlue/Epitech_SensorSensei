# Epitech_SensorSensei

This project aims to pool a civic effort to measure air quality at a global level. In order to store the measured values sent by our sensors, we built an API in NodeJS connected to a SQLite database.

# API & Database

The api is located in the <code>api/</code> folder. It requires a _NodeJS_ package manager (e.g: <code>yarn</code> or <code>npm</code>) as well as the _sqlite3_ command.

The following exemples are based on <code>yarn</code>'s <code>1.22.18</code> version.

To setup the database run:

-   <code>cd api/src/</code>
-   <code>sqlite3 db.db</code>
-   <code>.read tables.sql</code>
    This will create a _data_ table in the _db.db_ file.

To run the API from the root folder run:

-   <code>cd api/</code>
-   <code>yarn</code>
-   <code>node index.js</code>

It's documentation is available <a href="https://documenter.getpostman.com/view/10915279/UVyuRaYE">here</a>

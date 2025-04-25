#!/bin/bash

psql -U postgres -c "CREATE USER $PGUSER WITH PASSWORD '$PGPASSWORD'"
psql -U postgres -c "CREATE DATABASE exercise_tracker WITH OWNER = $PGUSER"
psql -U postgres -d exercise_tracker -c "CREATE TABLE USERS (_ID SERIAL PRIMARY KEY, username TEXT NOT NULL)" 
psql -U postgres -d exercise_tracker -c "GRANT SELECT, INSERT, UPDATE, DELETE ON USERS TO $PGUSER"
psql -U postgres -d exercise_tracker -c "GRANT USAGE, SELECT ON SEQUENCE USERS__id_seq TO $PGUSER"
psql -U postgres -d exercise_tracker -c "CREATE TABLE EXERCISES (_ID SERIAL PRIMARY KEY, description TEXT NOT NULL, duration INT NOT NULL, date DATE NOT NULL, user_id INT REFERENCES USERS(_ID))"
psql -U postgres -d exercise_tracker -c "GRANT SELECT, INSERT, UPDATE, DELETE ON EXERCISES TO $PGUSER"
psql -U postgres -d exercise_tracker -c "GRANT USAGE, SELECT ON SEQUENCE EXERCISES__id_seq TO $PGUSER"
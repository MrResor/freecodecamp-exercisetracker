#!/bin/bash

psql -U postgres -c "CREATE USER $PGUSER WITH PASSWORD '$PGPASSWORD'"
psql -U postgres -c "CREATE DATABASE exercise_tracker WITH OWNER = $PGUSER"
psql -U postgres -d exercise_tracker -c "CREATE SEQUENCE tag_seq START WITH 1"
psql -U postgres -d exercise_tracker -c "CREATE TABLE USERS (_ID TEXT PRIMARY KEY NOT NULL DEFAULT 'id_'||nextval('tag_seq'::regclass), username TEXT NOT NULL UNIQUE)" 
psql -U postgres -d exercise_tracker -c "GRANT SELECT, INSERT, UPDATE, DELETE ON USERS TO $PGUSER"
psql -U postgres -d exercise_tracker -c "GRANT USAGE, SELECT ON SEQUENCE tag_seq TO $PGUSER"
psql -U postgres -d exercise_tracker -c "CREATE TABLE EXERCISES (_ID SERIAL PRIMARY KEY, description TEXT NOT NULL, duration INT NOT NULL, date DATE NOT NULL, user_id TEXT REFERENCES USERS(_ID))"
psql -U postgres -d exercise_tracker -c "GRANT SELECT, INSERT, UPDATE, DELETE ON EXERCISES TO $PGUSER"
psql -U postgres -d exercise_tracker -c "GRANT USAGE, SELECT ON SEQUENCE EXERCISES__id_seq TO $PGUSER"
psql -U postgres -d exercise_tracker -c "GRANT CONNECT ON DATABASE exercise_tracker TO $PGUSER"
psql -U postgres -d exercise_tracker -c "GRANT USAGE ON SCHEMA public TO $PGUSER"
psql -U postgres -d exercise_tracker -c "\du"
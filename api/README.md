# Caradisiac api
> API to get the cars with the biggest volume and add records

## What is it ?
Caradisiac api provides endpoints to get the cars with the biggest volume and add record.

## Quick setup
Open a terminal in the api folder and type:
`$ npm install`

## Getting started

In the same terminal than previously just type :
`$ npm start`

The server will start, and will : 

 #### - fetch all the car models with the node-car api
 #### - save them in a file named 'models.json'
 #### - try to create an index 'models' on elasticsearch (it will detect if the index already exist or not)
 #### - push on the data base all the models at the index 'models' in the type 'model'
 
 Then the server will be listening on the port 9292.
 
 It provides three endpoints:
 
 `POST /populate` which will add to the database a given model<br>
 `POST /populateArray` which will add to the database a given array of models<br>
 `GET /cars` which will return the 10 cars with the highest volume<br>
 

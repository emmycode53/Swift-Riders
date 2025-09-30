#Swift riders backend

#project over view#

swift riders is a logistic backend application, build with nodejs, express using mongo DB to store datas,it handles user's auhentication, delivery request payments and analytics.

#Tech stack
nodejs
express
mongoDB + mongoose
paystack API
JWT authentication,
Jest + supertest

#setup instruction 
clone this repository
https://github.com/emmycode53/Swift-Riders.git
git clone
cd swift-rider
git pull -origin main

#to install dependencies
npm install

#create a .env file and create the following enviroment variables
PORT= your port_here
MONGO_ATLAS_URI = your DB uri here
JWT_SECRET = your JWT secret key here
PAYSTACK_SECRET_KEY = your paystack secret key here
USER_PASSWORD = your app password for your email here
USER_EMAIL = your email here

#to start server use this command
npm start

#to start nodemon command
npm run dev

#to test command
npm test

#author 
Isaac Emmanuel
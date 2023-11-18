[![Made with Node.js](https://img.shields.io/badge/Node.js->=14-blue?logo=node.js&logoColor=green)](https://nodejs.org "Go to Node.js homepage")
[![Made with React](https://img.shields.io/badge/React-17-blue?logo=react&logoColor=#61DAFB)](https://reactjs.org "Go to React homepage")

[![Twitter Follow](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/arpanmondal25)
[![Linkedin Follow](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/arpanmondal25/)


## 🤔 What is Planigo?
Introducing Planigo: the comprehensive solution for Task management. Simplify assignments, monitor progress This adaptable, open-source platform is designed to be user-friendly, making it the optimal option for streamlined and cohesive Task management. Bid farewell to the confusion of multiple tools and welcome the ease and capability of Planigo!


## ✨ Features

🚀 Open Source Task Management: Seamlessly plan sprints and milestones.  
✅ Efficient Task Management: Engineering sprints are a chaos without grouping of tasks for specific milestones, this gives clear visibility to all the different sprint goals and owners of each task.  
🔒 Security: Oauth login for your organisation's users, just setup a google oauth app for internal access and pass the client id.


## 🚀 Getting Started
To getting started in local development environment, just fork the project git repository and follow the below steps:

Execute the shell script `setup.sh` to automatically setup the Frontend and the Backend codes.(Make sure your terminal has appropriate permissions to execute a shellscript)

The shellscript will install appropriate dependencies both for frontend and backend codes, and also create `.env` files populated with sample values.

Follow the below steps to populate real `.env` values for specific variables:

To get the `GOOGLE_CLIENT_ID` follow below steps:
1. Visit: https://console.cloud.google.com/apis/credentials
2. Create a project
3. Setup Oauth Consent screen
4. Under Credentials tab create a credential, Chose `Oauth Client Id` from the dropdown
5. Give application type as `Web Application`
6. Give a name to the credential of your choice
7. For `Authorized JavaScript origins` add 2 values: `http://localhost:3000` & `http://localhost`
8. For `Authorized redirect URIs` add 2 values: `http://localhost:3001/login` and `http://localhost` and press `Create`
9. This would create a google Oauth credential for you and a modal would open copy the `Client ID` and paste in 2 places

Replace value: [`REACT_APP_GOOGLE_OAUTH_CLIENT_ID`](/.env) <-- click
Replace value: [`GOOGLE_CLIENT_ID`](/Server/.env) <-- click

Now your setup should be completed 🤞

Now to run the app locally:  
1. Make sure your mongoDb is running locally, and you have opened your mongoDB compass
2. In the root directory run `npm start`
3. Open a new Terminal tab, go inside the `Server folder` and run `npm start`
4. That should start your Frontend app in port: `3000` and backend in port: `3001`. Make sure the ports are exact as the Google Oauth client id is configured in that way above.











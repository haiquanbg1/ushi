require("dotenv").config();
const express = require('express');

const serverConfig = require("./config/serverConfig");

const app = express();

serverConfig(app);

var express = require("express");
var app = express();
var http = require("http").Server(app);
var path = require("path");



var User = require('./models/user');
var Project = require('./models/project');

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const config_1 = require("../config/config");
const { database } = config_1.settings;
(0, mongoose_1.connect)(`${database}elsafrica-grp`)
    .then(() => console.log('DB connected sucessfullly'))
    .catch((e) => console.log(e));

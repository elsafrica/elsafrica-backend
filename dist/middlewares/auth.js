"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passportStatic = void 0;
const Admin_1 = require("../models/Admin");
const passport_jwt_1 = require("passport-jwt");
const options = { jwtFromRequest: () => '', secretOrKey: '' };
options.jwtFromRequest = passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken();
options.secretOrKey = process.env.JWT_SECRET || '';
const passportStatic = (passport) => {
    passport.use(new passport_jwt_1.Strategy(options, (jwt_payload, done) => {
        Admin_1.Admin.findById(jwt_payload.id)
            .then((user) => {
            if (user) {
                return done(null, { id: user._id.toString() });
            }
            return done(null, false);
        })
            .catch((err) => {
            console.log(err);
        });
    }));
};
exports.passportStatic = passportStatic;

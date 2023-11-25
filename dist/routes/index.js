"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-var-requires */
const express_1 = require("express");
const router = (0, express_1.Router)();
// Create an array of routes to require and use
const routes = [{
        route: '/auth',
        path: 'auth.routes'
    }, {
        route: '/accounts',
        path: 'accounts.routes'
    }, {
        route: '/customers',
        path: 'customers.routes'
    }, {
        route: '/packages',
        path: 'packages.routes'
    }, {
        route: '/messages',
        path: 'messages.routes'
    }, {
        route: '/assets',
        path: 'assets.routes'
    },];
// For each path in the `routes` array, set up the URI and require the route
for (const route of routes) {
    router.use(`${route.route}`, require(`./${route.path}`).default);
}
exports.default = router;

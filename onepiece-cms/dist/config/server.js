"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ({ env }) => ({
    host: env('HOST', '127.0.0.1'),
    port: env.int('PORT', 1337),
    app: {
        keys: env.array('APP_KEYS', ['mySuperSecretKey1', 'mySuperSecretKey2']),
    },
});

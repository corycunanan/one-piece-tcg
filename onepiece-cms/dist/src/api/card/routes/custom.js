"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    routes: [
        {
            method: 'POST',
            path: '/api/cards/bulk-delete',
            handler: 'api::card.card.bulkDelete',
            config: {
                auth: {
                    scope: ['api::card.card.delete']
                }
            }
        }
    ]
};

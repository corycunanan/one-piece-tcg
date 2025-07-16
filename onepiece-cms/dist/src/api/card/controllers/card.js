"use strict";
/**
 * card controller
 */
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreController('api::card.card', ({ strapi }) => ({
    async bulkDelete(ctx) {
        try {
            const { ids } = ctx.request.body;
            if (!ids || !Array.isArray(ids)) {
                return ctx.badRequest('ids array is required');
            }
            console.log(`🗑️ Bulk deleting ${ids.length} cards...`);
            let deletedCount = 0;
            for (const id of ids) {
                try {
                    // Force hard delete by directly accessing the database
                    await strapi.db.query('api::card.card').delete({
                        where: { id }
                    });
                    deletedCount++;
                    console.log(`✅ Deleted card ID: ${id}`);
                }
                catch (error) {
                    console.error(`❌ Failed to delete card ID ${id}:`, error.message);
                }
            }
            ctx.body = {
                success: true,
                deleted: deletedCount,
                total: ids.length
            };
        }
        catch (error) {
            console.error('Bulk delete error:', error);
            ctx.throw(500, 'Bulk delete failed');
        }
    }
}));

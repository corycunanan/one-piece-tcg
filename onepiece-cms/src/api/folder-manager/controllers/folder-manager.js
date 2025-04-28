export default {
    async create(ctx) {
      const { name, parent } = ctx.request.body;
  
      if (!name) {
        return ctx.badRequest('Folder name is required');
      }
  
      const uploadService = strapi.plugin('upload').service('folder');
  
      const folder = await uploadService.create({
        name,
        parent,
      });
  
      ctx.body = {
        id: folder.id,
        name: folder.name,
      };
    },
  };
  
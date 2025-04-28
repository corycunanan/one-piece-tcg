export default ({ strapi }) => {
    strapi.server.routes([
      {
        method: 'POST',
        path: '/folder-manager/create',
        handler: async (ctx) => {
          const { name, parent } = ctx.request.body;
  
          if (!name) {
            ctx.throw(400, 'Folder name is required');
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
        config: {
          auth: false, // <--- make public
        },
      },
    ]);
  };
  
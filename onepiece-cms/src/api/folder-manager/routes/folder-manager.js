export default {
    routes: [
      {
        method: 'POST',
        path: '/folder-manager/create',
        handler: 'api::folder-manager.folder-manager.create', // Important: this format
        config: {
          auth: false,
        },
      },
    ],
  };
  
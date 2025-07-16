export default {
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
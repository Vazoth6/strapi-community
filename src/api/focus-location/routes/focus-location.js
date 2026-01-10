'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/focus-locations',
      handler: 'focus-location.find',
      config: {
        policies: [],
        middlewares: [],
      }
    },
    {
      method: 'GET',
      path: '/focus-locations/:id',
      handler: 'focus-location.findOne',
      config: {
        policies: [],
        middlewares: [],
      }
    },
    {
      method: 'POST',
      path: '/focus-locations',
      handler: 'focus-location.create',
      config: {
        policies: [],
        middlewares: [],
      }
    },
    {
      method: 'PUT',
      path: '/focus-locations/:id',
      handler: 'focus-location.update',
      config: {
        policies: [],
        middlewares: [],
      }
    },
    {
      method: 'DELETE',
      path: '/focus-locations/:id',
      handler: 'focus-location.delete',
      config: {
        policies: [],
        middlewares: [],
      }
    },
    {
      method: 'PUT',
      path: '/focus-locations/:id/toggle',
      handler: 'focus-location.toggle',
      config: {
        policies: [],
        middlewares: [],
      }
    },
    {
      method: 'GET',
      path: '/focus-locations/active',
      handler: 'focus-location.findActive',
      config: {
        policies: [],
        middlewares: [],
      }
    }
  ]
};
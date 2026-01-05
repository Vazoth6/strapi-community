'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/daily-stat',
      handler: 'daily-stat.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/daily-stat/:id',
      handler: 'daily-stat.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/daily-stat',
      handler: 'daily-stat.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/daily-stat/:id',
      handler: 'daily-stat.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/daily-stat/:id',
      handler: 'daily-stat.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
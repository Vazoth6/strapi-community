'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/task',
      handler: 'task.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/task/:id',
      handler: 'task.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/task',
      handler: 'task.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/task/:id',
      handler: 'task.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/task/:id',
      handler: 'task.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
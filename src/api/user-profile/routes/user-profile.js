'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/user-profile/me',
      handler: 'user-profile.findMe',
      config: {
        policies: [],
        middlewares: [],
        auth: {
          strategies: ['jwt'],
          scope: ['authenticated']
        }
      }
    },
    {
      method: 'GET',
      path: '/user-profile',
      handler: 'user-profile.find',
      config: {
        policies: [],
        middlewares: [],
        auth: {
          strategies: ['jwt'],
          scope: ['authenticated']
        }
      }
    },
    {
      method: 'GET',
      path: '/user-profile/:id',
      handler: 'user-profile.findOne',
      config: {
        policies: [],
        middlewares: [],
        auth: {
          strategies: ['jwt'],
          scope: ['authenticated']
        }
      }
    },
    {
      method: 'PUT',
      path: '/user-profile/:id',
      handler: 'user-profile.update',
      config: {
        policies: [],
        middlewares: [],
        auth: {
          strategies: ['jwt'],
          scope: ['authenticated']
        }
      }
    },
    {
      method: 'POST',
      path: '/user-profile',
      handler: 'user-profile.create',
      config: {
        policies: [],
        middlewares: [],
        auth: {
          strategies: ['jwt'],
          scope: ['authenticated']
        }
      }
    },
    {
      method: 'DELETE',
      path: '/user-profile/:id',
      handler: 'user-profile.delete',
      config: {
        policies: [],
        middlewares: [],
        auth: {
          strategies: ['jwt'],
          scope: ['authenticated']
        }
      }
    }
  ]
};
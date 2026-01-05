'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::user-profile.user-profile', ({ strapi }) => ({
  async findMe(ctx) {
    const user = ctx.state.user;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in to view your profile');
    }

    try {
      // Buscar o perfil associado ao usuário
      const userProfile = await strapi.entityService.findMany('api::user-profile.user-profile', {
        filters: { user: user.id },
        populate: ['avatar', 'user'],
        limit: 1
      });

      if (!userProfile || userProfile.length === 0) {
        // Se não existir perfil, criar um com valores padrão
        const newProfile = await strapi.entityService.create('api::user-profile.user-profile', {
          data: {
            fullName: user.username || user.email.split('@')[0],
            timezone: 'Europe/Lisbon',
            dailyGoalMinutes: 240,
            pomodoroWorkDuration: 25,
            pomodoroShortBreak: 5,
            pomodoroLongBreak: 15,
            user: user.id,
            publishedAt: new Date()
          },
          populate: ['avatar', 'user']
        });
        
        return this.transformResponse(newProfile);
      }

      return this.transformResponse(userProfile[0]);
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async update(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    if (!user) {
      return ctx.unauthorized('You must be logged in to update profile');
    }

    // Verificar se o perfil pertence ao usuário
    const existingProfile = await strapi.entityService.findOne('api::user-profile.user-profile', id, {
      populate: ['user']
    });

    if (!existingProfile || existingProfile.user.id !== user.id) {
      return ctx.forbidden('You can only update your own profile');
    }

    const { data } = ctx.request.body;

    try {
      const updatedProfile = await strapi.entityService.update('api::user-profile.user-profile', id, {
        data: {
          ...data,
          updatedAt: new Date()
        },
        populate: ['avatar', 'user']
      });

      return this.transformResponse(updatedProfile);
    } catch (error) {
      ctx.throw(500, error);
    }
  }
}));
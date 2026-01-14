'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

// Controlador para gestão de perfis de utilizador
// Herda funcionalidades base do Strapi e adiciona métodos customizados
module.exports = createCoreController('api::user-profile.user-profile', ({ strapi }) => ({

  // Método para obter o perfil do utilizador autenticado
  // Cria um perfil automático se não existir (padrão de auto-criação)
  async findMe(ctx) {
    const user = ctx.state.user;
    
    // Validação básica de autenticação
    if (!user) {
      return ctx.unauthorized('You must be logged in to view your profile');
    }

    try {
      // Buscar o perfil associado ao utilizador atual
      // Limite de 1 porque cada utilizador só deve ter um perfil
      const userProfile = await strapi.entityService.findMany('api::user-profile.user-profile', {
        filters: { user: user.id }, // Filtro pelo ID do utilizador autenticado
        populate: ['avatar', 'user'], // Incluir avatar e dados do utilizador
        limit: 1
      });

      // Se o perfil não existir, criar um automaticamente
      if (!userProfile || userProfile.length === 0) {
        // Criar perfil com valores padrão (onboarding automático)
        const newProfile = await strapi.entityService.create('api::user-profile.user-profile', {
          data: {
            fullName: user.username || user.email.split('@')[0], // Usar username ou parte do email
            timezone: 'Europe/Lisbon',
            dailyGoalMinutes: 240,
            pomodoroWorkDuration: 25,
            pomodoroShortBreak: 5,
            pomodoroLongBreak: 15,
            user: user.id,
            publishedAt: new Date()
          },
          populate: ['avatar', 'user'] // Retornar dados populados
        });

      // Usar transformResponse do controlador base para formatação consistente
        return this.transformResponse(newProfile);
      }

      // Retornar perfil existente (primeiro e único do array)
      return this.transformResponse(userProfile[0]);
    } catch (error) {
      // Propagar erro com status 500
      ctx.throw(500, error);
    }
  },

  // Método para atualizar o perfil do utilizador
  // Inclui validação de propriedade (só pode atualizar o próprio perfil)
  async update(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    // Verificar autenticação
    if (!user) {
      return ctx.unauthorized('You must be logged in to update profile');
    }

    // Verificar se o perfil existe e pertence ao utilizador autenticado
    const existingProfile = await strapi.entityService.findOne('api::user-profile.user-profile', id, {
      populate: ['user'] // Precisamos do user para validação
    });

    // Validação de propriedade: só o dono pode atualizar
    if (!existingProfile || existingProfile.user.id !== user.id) {
      return ctx.forbidden('You can only update your own profile');
    }

    const { data } = ctx.request.body;

    try {
      // Atualizar perfil com os novos dados
      const updatedProfile = await strapi.entityService.update('api::user-profile.user-profile', id, {
        data: {
          ...data, // Spread dos dados recebidos
          updatedAt: new Date() // Atualizar timestamp automaticamente
        },
        populate: ['avatar', 'user'] // Retornar dados atualizados com relações
      });

      // Formatar resposta usando o método do controlador base
      return this.transformResponse(updatedProfile);
    } catch (error) {
      ctx.throw(500, error);
    }
  }
}));
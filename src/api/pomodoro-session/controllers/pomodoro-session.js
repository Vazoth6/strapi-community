'use strict';

module.exports = {
  async find(ctx) {
    try {
      console.log('📡 GET /api/pomodoro-sessions chamado');
      
      // Obter o usuário autenticado
      const user = ctx.state.user;
      
      if (!user) {
        console.log('❌ Usuário não autenticado');
        return ctx.unauthorized('You must be logged in to view pomodoro sessions.');
      }
      
      console.log(`✅ Usuário autenticado: ${user.id} (${user.email})`);
      
      // Filtrar sessões apenas do usuário atual
      const filters = {
        user: user.id
      };
      
      // Adicionar filtros adicionais da query
      if (ctx.query.filters) {
        const queryFilters = JSON.parse(ctx.query.filters);
        Object.assign(filters, queryFilters);
      }
      
      const sessions = await strapi.entityService.findMany('api::pomodoro-session.pomodoro-session', {
        filters,
        sort: { startTime: 'desc' },
        populate: ['user', 'task']
      });
      
      console.log(`✅ ${sessions.length} sessões encontradas para o usuário ${user.id}`);
      
      const data = sessions.map(session => ({
        id: session.id,
        attributes: {
          sessionType: session.sessionType || 'WORK',
          startTime: session.startTime,
          endTime: session.endTime,
          durationMinutes: session.durationMinutes || 25,
          completed: session.completed || false,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          userId: session.user ? session.user.id : null,
          taskId: session.task ? session.task.id : null
        }
      }));
      
      return { data };
    } catch (error) {
      console.error('❌ Erro em find pomodoro sessions:', error.message, error.stack);
      return ctx.internalServerError(`Error: ${error.message}`);
    }
  },

  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      console.log(`📡 GET /api/pomodoro-sessions/${id} chamado`);
      
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('You must be logged in to view pomodoro sessions.');
      }
      
      const session = await strapi.entityService.findOne('api::pomodoro-session.pomodoro-session', id, {
        populate: ['user', 'task']
      });
      
      if (!session) {
        return ctx.notFound('Pomodoro session not found');
      }
      
      // Verificar se a sessão pertence ao usuário
      if (!session.user || session.user.id !== user.id) {
        console.log(`❌ Tentativa de acesso não autorizado: Usuário ${user.id} tentou acessar sessão ${id} do usuário ${session.user?.id}`);
        return ctx.forbidden('You do not have permission to view this pomodoro session.');
      }
      
      return {
        data: {
          id: session.id,
          attributes: {
            sessionType: session.sessionType,
            startTime: session.startTime,
            endTime: session.endTime,
            durationMinutes: session.durationMinutes,
            completed: session.completed,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt
          }
        }
      };
    } catch (error) {
      console.error('❌ Erro em findOne:', error);
      return ctx.internalServerError('Error fetching pomodoro session');
    }
  },

  async create(ctx) {
    try {
      console.log('📡 POST /api/pomodoro-sessions chamado');
      
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('You must be logged in to create pomodoro sessions.');
      }
      
      const { data } = ctx.request.body;
      
      if (!data || !data.attributes) {
        return ctx.badRequest('Missing data.attributes');
      }
      
      // Associar a sessão ao usuário atual
      const sessionData = {
        ...data.attributes,
        user: user.id  // ASSOCIA AO USUÁRIO LOGADO
      };
      
      console.log(`✅ Criando sessão pomodoro para o usuário ${user.id}`);
      
      const session = await strapi.entityService.create('api::pomodoro-session.pomodoro-session', {
        data: sessionData
      });
      
      console.log(`✅ Sessão criada: ${session.id} para o usuário ${user.id}`);
      
      return {
        data: {
          id: session.id,
          attributes: {
            sessionType: session.sessionType,
            startTime: session.startTime,
            endTime: session.endTime,
            durationMinutes: session.durationMinutes,
            completed: session.completed,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt
          }
        }
      };
    } catch (error) {
      console.error('❌ Erro em create:', error);
      return ctx.internalServerError('Error creating pomodoro session');
    }
  },

  async update(ctx) {
    try {
      const { id } = ctx.params;
      console.log(`📡 PUT /api/pomodoro-sessions/${id} chamado`);
      
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('You must be logged in to update pomodoro sessions.');
      }
      
      // Primeiro verificar se a sessão existe e pertence ao usuário
      const existingSession = await strapi.entityService.findOne('api::pomodoro-session.pomodoro-session', id, {
        populate: ['user']
      });
      
      if (!existingSession) {
        return ctx.notFound('Pomodoro session not found');
      }
      
      if (!existingSession.user || existingSession.user.id !== user.id) {
        console.log(`❌ Tentativa de atualização não autorizada: Usuário ${user.id} tentou atualizar sessão ${id} do usuário ${existingSession.user?.id}`);
        return ctx.forbidden('You do not have permission to update this pomodoro session.');
      }
      
      const { data } = ctx.request.body;
      
      if (!data || !data.attributes) {
        return ctx.badRequest('Missing data.attributes');
      }
      
      const updatedSession = await strapi.entityService.update('api::pomodoro-session.pomodoro-session', id, {
        data: data.attributes
      });
      
      return {
        data: {
          id: updatedSession.id,
          attributes: {
            sessionType: updatedSession.sessionType,
            startTime: updatedSession.startTime,
            endTime: updatedSession.endTime,
            durationMinutes: updatedSession.durationMinutes,
            completed: updatedSession.completed,
            createdAt: updatedSession.createdAt,
            updatedAt: updatedSession.updatedAt
          }
        }
      };
    } catch (error) {
      console.error('❌ Erro em update:', error);
      return ctx.internalServerError('Error updating pomodoro session');
    }
  },

  async delete(ctx) {
    try {
      const { id } = ctx.params;
      console.log(`📡 DELETE /api/pomodoro-sessions/${id} chamado`);
      
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('You must be logged in to delete pomodoro sessions.');
      }
      
      // Primeiro verificar se a sessão existe e pertence ao usuário
      const existingSession = await strapi.entityService.findOne('api::pomodoro-session.pomodoro-session', id, {
        populate: ['user']
      });
      
      if (!existingSession) {
        return ctx.notFound('Pomodoro session not found');
      }
      
      if (!existingSession.user || existingSession.user.id !== user.id) {
        console.log(`❌ Tentativa de exclusão não autorizada: Usuário ${user.id} tentou excluir sessão ${id} do usuário ${existingSession.user?.id}`);
        return ctx.forbidden('You do not have permission to delete this pomodoro session.');
      }
      
      await strapi.entityService.delete('api::pomodoro-session.pomodoro-session', id);
      
      console.log(`✅ Sessão ${id} deletada pelo usuário ${user.id}`);
      
      return { data: null };
    } catch (error) {
      console.error('❌ Erro em delete:', error);
      return ctx.internalServerError('Error deleting pomodoro session');
    }
  }
};
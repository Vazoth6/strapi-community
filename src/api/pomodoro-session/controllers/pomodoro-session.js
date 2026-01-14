'use strict';

module.exports = {

  // Controlador para obter todas as sessões Pomodoro do utilizador autenticado
  async find(ctx) {
    try {
      console.log(' GET /api/pomodoro-sessions chamado');
      
      // Obter o utilizador autenticado a partir do contexto
      const user = ctx.state.user;
      
      if (!user) {
        console.log(' Usuário não autenticado');
        return ctx.unauthorized('You must be logged in to view pomodoro sessions.');
      }
      
      console.log(` Usuário autenticado: ${user.id} (${user.email})`);
      
      // Filtro base: apenas sessões do utilizador atual
      const filters = {
        user: user.id
      };
      
      // Combinar com filtros adicionais da query string, se existirem
      if (ctx.query.filters) {
        const queryFilters = JSON.parse(ctx.query.filters);
        Object.assign(filters, queryFilters);
      }
      
      // Buscar sessões com filtros aplicados
      const sessions = await strapi.entityService.findMany('api::pomodoro-session.pomodoro-session', {
        filters,
        sort: { startTime: 'desc' }, // Ordenar por hora de início (mais recentes primeiro)
        populate: ['user', 'task'] // Incluir dados do utilizador e tarefa associada
      });
      
      console.log(` ${sessions.length} sessões encontradas para o usuário ${user.id}`);
      
      // Formatar resposta no padrão JSON API
      const data = sessions.map(session => ({
        id: session.id,
        attributes: {
          sessionType: session.sessionType || 'WORK', // Valor padrão: sessão de trabalho
          startTime: session.startTime,
          endTime: session.endTime,
          durationMinutes: session.durationMinutes || 25, // Duração padrão de 25 minutos
          completed: session.completed || false,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          userId: session.user ? session.user.id : null, // ID do utilizador dono da sessão
          taskId: session.task ? session.task.id : null // ID da tarefa associada (se existir)
        }
      }));
      
      return { data };
    } catch (error) {
      console.error(' Erro em find pomodoro sessions:', error.message, error.stack);
      return ctx.internalServerError(`Error: ${error.message}`);
    }
  },

  // Controlador para obter uma sessão Pomodoro específica por ID
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      console.log(` GET /api/pomodoro-sessions/${id} chamado`);
      
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('You must be logged in to view pomodoro sessions.');
      }
      
      // Buscar sessão pelo ID com dados do utilizador e tarefa
      const session = await strapi.entityService.findOne('api::pomodoro-session.pomodoro-session', id, {
        populate: ['user', 'task']
      });
      
      if (!session) {
        return ctx.notFound('Pomodoro session not found');
      }
      
      // Verificar se a sessão pertence ao utilizador autenticado
      if (!session.user || session.user.id !== user.id) {
        console.log(` Tentativa de acesso não autorizado: Usuário ${user.id} tentou acessar sessão ${id} do usuário ${session.user?.id}`);
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
      console.error(' Erro em findOne:', error);
      return ctx.internalServerError('Error fetching pomodoro session');
    }
  },

  // Controlador para criar uma nova sessão Pomodoro
  async create(ctx) {
    try {
      console.log(' POST /api/pomodoro-sessions chamado');
      
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('You must be logged in to create pomodoro sessions.');
      }
      
      const { data } = ctx.request.body;
      
      if (!data || !data.attributes) {
        return ctx.badRequest('Missing data.attributes');
      }
      
      // Preparar dados da sessão, associando automaticamente ao utilizador atual
      const sessionData = {
        ...data.attributes,
        user: user.id  // Associação automática ao utilizador autenticado
      };
      
      console.log(` Criando sessão pomodoro para o usuário ${user.id}`);
      
      // Criar a sessão na base de dados
      const session = await strapi.entityService.create('api::pomodoro-session.pomodoro-session', {
        data: sessionData
      });
      
      console.log(` Sessão criada: ${session.id} para o usuário ${user.id}`);
      
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
      console.error(' Erro em create:', error);
      return ctx.internalServerError('Error creating pomodoro session');
    }
  },

  // Controlador para atualizar uma sessão Pomodoro existente
  async update(ctx) {
    try {
      const { id } = ctx.params;
      console.log(` PUT /api/pomodoro-sessions/${id} chamado`);
      
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('You must be logged in to update pomodoro sessions.');
      }
      
      // Primeiro verificar se a sessão existe e quem é o seu dono
      const existingSession = await strapi.entityService.findOne('api::pomodoro-session.pomodoro-session', id, {
        populate: ['user']
      });
      
      if (!existingSession) {
        return ctx.notFound('Pomodoro session not found');
      }
      
      // Verificar se o utilizador atual é o dono da sessão
      if (!existingSession.user || existingSession.user.id !== user.id) {
        console.log(` Tentativa de atualização não autorizada: Usuário ${user.id} tentou atualizar sessão ${id} do usuário ${existingSession.user?.id}`);
        return ctx.forbidden('You do not have permission to update this pomodoro session.');
      }
      
      const { data } = ctx.request.body;
      
      if (!data || !data.attributes) {
        return ctx.badRequest('Missing data.attributes');
      }

      // Atualizar a sessão com os novos dados
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
      console.error(' Erro em update:', error);
      return ctx.internalServerError('Error updating pomodoro session');
    }
  },

  // Controlador para apagar uma sessão Pomodoro
  async delete(ctx) {
    try {
      const { id } = ctx.params;
      console.log(` DELETE /api/pomodoro-sessions/${id} chamado`);
      
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('You must be logged in to delete pomodoro sessions.');
      }
      
      // Primeiro verificar se a sessão existe e quem é o seu dono
      const existingSession = await strapi.entityService.findOne('api::pomodoro-session.pomodoro-session', id, {
        populate: ['user']
      });
      
      if (!existingSession) {
        return ctx.notFound('Pomodoro session not found');
      }
      
      // Verificar se o utilizador atual é o dono da sessão
      if (!existingSession.user || existingSession.user.id !== user.id) {
        console.log(` Tentativa de exclusão não autorizada: Usuário ${user.id} tentou excluir sessão ${id} do usuário ${existingSession.user?.id}`);
        return ctx.forbidden('You do not have permission to delete this pomodoro session.');
      }
      
      // Apagar a sessão da base de dados
      await strapi.entityService.delete('api::pomodoro-session.pomodoro-session', id);
      
      console.log(` Sessão ${id} deletada pelo usuário ${user.id}`);
      
      return { data: null }; // Resposta vazia indicando sucesso
    } catch (error) {
      console.error(' Erro em delete:', error);
      return ctx.internalServerError('Error deleting pomodoro session');
    }
  }
};
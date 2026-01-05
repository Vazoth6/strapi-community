'use strict';

module.exports = {
  async find(ctx) {
    try {
      console.log('📡 GET /api/task chamado');
      
      // Obter o usuário autenticado do token JWT
      const user = ctx.state.user;
      
      if (!user) {
        console.log('❌ Usuário não autenticado');
        return ctx.unauthorized('You must be logged in to view tasks.');
      }
      
      console.log(`✅ Usuário autenticado: ${user.id} (${user.email})`);
      
      // Filtrar tarefas apenas do usuário atual
      const tasks = await strapi.entityService.findMany('api::task.task', {
        filters: {
          user: user.id  // FILTRO POR USUÁRIO
        },
        sort: { createdAt: 'desc' },
        populate: ['user']
      });
      
      console.log(`✅ ${tasks.length} tarefas encontradas para o usuário ${user.id}`);
      
      const data = tasks.map(task => ({
        id: task.id,
        attributes: {
          title: task.title || '',
          description: task.description || '',
          dueDate: task.dueDate,
          priority: task.priority || 'MEDIUM',
          completed: task.completed || false,
          completedAt: task.completedAt,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          // Incluir userId se quiser no frontend
          userId: task.user ? task.user.id : null
        }
      }));
      
      return { data };
    } catch (error) {
      console.error('❌ Erro em find:', error.message, error.stack);
      return ctx.internalServerError(`Error: ${error.message}`);
    }
  },

  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      console.log(`📡 GET /api/task/${id} chamado`);
      
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('You must be logged in to view tasks.');
      }
      
      const task = await strapi.entityService.findOne('api::task.task', id, {
        populate: ['user']
      });
      
      if (!task) {
        return ctx.notFound('Task not found');
      }
      
      // Verificar se a tarefa pertence ao usuário
      if (!task.user || task.user.id !== user.id) {
        console.log(`❌ Tentativa de acesso não autorizado: Usuário ${user.id} tentou acessar tarefa ${id} do usuário ${task.user?.id}`);
        return ctx.forbidden('You do not have permission to view this task.');
      }
      
      return {
        data: {
          id: task.id,
          attributes: {
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
            priority: task.priority,
            completed: task.completed,
            completedAt: task.completedAt,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt
          }
        }
      };
    } catch (error) {
      console.error('❌ Erro em findOne:', error);
      return ctx.internalServerError('Error fetching task');
    }
  },

  async create(ctx) {
    try {
      console.log('📡 POST /api/task chamado');
      
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('You must be logged in to create tasks.');
      }
      
      const { data } = ctx.request.body;
      
      if (!data || !data.attributes) {
        return ctx.badRequest('Missing data.attributes');
      }
      
      // Associar a tarefa ao usuário atual
      const taskData = {
        ...data.attributes,
        user: user.id  // ASSOCIA AO USUÁRIO LOGADO
      };
      
      console.log(`✅ Criando tarefa para o usuário ${user.id}`);
      
      const task = await strapi.entityService.create('api::task.task', {
        data: taskData
      });
      
      console.log(`✅ Tarefa criada: ${task.id} - ${task.title} para o usuário ${user.id}`);
      
      return {
        data: {
          id: task.id,
          attributes: {
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
            priority: task.priority,
            completed: task.completed,
            completedAt: task.completedAt,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt
          }
        }
      };
    } catch (error) {
      console.error('❌ Erro em create:', error);
      return ctx.internalServerError('Error creating task');
    }
  },

  async update(ctx) {
    try {
      const { id } = ctx.params;
      console.log(`📡 PUT /api/task/${id} chamado`);
      
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('You must be logged in to update tasks.');
      }
      
      // Primeiro verificar se a tarefa existe e pertence ao usuário
      const existingTask = await strapi.entityService.findOne('api::task.task', id, {
        populate: ['user']
      });
      
      if (!existingTask) {
        return ctx.notFound('Task not found');
      }
      
      if (!existingTask.user || existingTask.user.id !== user.id) {
        console.log(`❌ Tentativa de atualização não autorizada: Usuário ${user.id} tentou atualizar tarefa ${id} do usuário ${existingTask.user?.id}`);
        return ctx.forbidden('You do not have permission to update this task.');
      }
      
      const { data } = ctx.request.body;
      
      if (!data || !data.attributes) {
        return ctx.badRequest('Missing data.attributes');
      }
      
      const updatedTask = await strapi.entityService.update('api::task.task', id, {
        data: data.attributes
      });
      
      return {
        data: {
          id: updatedTask.id,
          attributes: {
            title: updatedTask.title,
            description: updatedTask.description,
            dueDate: updatedTask.dueDate,
            priority: updatedTask.priority,
            completed: updatedTask.completed,
            completedAt: updatedTask.completedAt,
            createdAt: updatedTask.createdAt,
            updatedAt: updatedTask.updatedAt
          }
        }
      };
    } catch (error) {
      console.error('❌ Erro em update:', error);
      return ctx.internalServerError('Error updating task');
    }
  },

  async delete(ctx) {
    try {
      const { id } = ctx.params;
      console.log(`📡 DELETE /api/task/${id} chamado`);
      
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('You must be logged in to delete tasks.');
      }
      
      // Primeiro verificar se a tarefa existe e pertence ao usuário
      const existingTask = await strapi.entityService.findOne('api::task.task', id, {
        populate: ['user']
      });
      
      if (!existingTask) {
        return ctx.notFound('Task not found');
      }
      
      if (!existingTask.user || existingTask.user.id !== user.id) {
        console.log(`❌ Tentativa de exclusão não autorizada: Usuário ${user.id} tentou excluir tarefa ${id} do usuário ${existingTask.user?.id}`);
        return ctx.forbidden('You do not have permission to delete this task.');
      }
      
      await strapi.entityService.delete('api::task.task', id);
      
      console.log(`✅ Tarefa ${id} deletada pelo usuário ${user.id}`);
      
      return { data: null };
    } catch (error) {
      console.error('❌ Erro em delete:', error);
      return ctx.internalServerError('Error deleting task');
    }
  }
};
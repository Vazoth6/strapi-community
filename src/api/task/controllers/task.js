'use strict';

module.exports = {
  async find(ctx) {
    try {
      console.log('📡 GET /api/task chamado');
      
      const user = ctx.state.user;
      
      if (!user) {
        console.log('❌ Usuário não autenticado');
        return ctx.unauthorized('You must be logged in to view tasks.');
      }
      
      console.log(`✅ Usuário autenticado: ${user.id} (${user.email})`);
      
      const tasks = await strapi.entityService.findMany('api::task.task', {
        filters: {
          user: user.id
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
          estimatedMinutes: task.estimatedMinutes || null, // Incluir o novo campo
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
            updatedAt: task.updatedAt,
            estimatedMinutes: task.estimatedMinutes || null // Incluir o novo campo
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
        console.log('👤 Usuário:', ctx.state.user);
        console.log('📦 Request body:', JSON.stringify(ctx.request.body, null, 2));
        
        const user = ctx.state.user;
        
        if (!user) {
            console.log('❌ Usuário não autenticado');
            return ctx.unauthorized('You must be logged in to create tasks.');
        }
        
        const { data } = ctx.request.body;
        
        if (!data || !data.attributes) {
            console.log('❌ Dados faltando:', { data: data });
            return ctx.badRequest('Missing data.attributes');
        }
        
        console.log('📋 Atributos recebidos:', data.attributes);
        
        // Log específico para cada campo
        console.log('🔍 Campos da tarefa:');
        console.log('- title:', data.attributes.title);
        console.log('- priority:', data.attributes.priority);
        console.log('- dueDate:', data.attributes.dueDate);
        console.log('- description:', data.attributes.description);
        console.log('- completed:', data.attributes.completed);
        console.log('- estimatedMinutes:', data.attributes.estimatedMinutes);
        
        // Verificar se o campo priority tem um valor válido
        const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];
        if (!validPriorities.includes(data.attributes.priority?.toUpperCase())) {
            console.log('❌ Prioridade inválida:', data.attributes.priority);
            return ctx.badRequest('Priority must be one of: LOW, MEDIUM, HIGH');
        }
        
        // Associar a tarefa ao usuário atual
        const taskData = {
            ...data.attributes,
            user: user.id,
            priority: data.attributes.priority.toUpperCase() // Garantir maiúsculas
        };
        
        console.log(`✅ Criando tarefa para o usuário ${user.id}`);
        console.log('📝 Dados completos:', JSON.stringify(taskData, null, 2));
        
        // Tentar criar a tarefa
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
                    updatedAt: task.updatedAt,
                    estimatedMinutes: task.estimatedMinutes || null
                }
            }
        };
    } catch (error) {
        console.error('❌ ERRO DETALHADO em create:');
        console.error('Mensagem:', error.message);
        console.error('Stack:', error.stack);
        console.error('Campo com erro:', error.details?.errors);
        
        return ctx.internalServerError(`Error creating task: ${error.message}`);
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
            updatedAt: updatedTask.updatedAt,
            estimatedMinutes: updatedTask.estimatedMinutes || null // Incluir o novo campo
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
  },

  async complete(ctx) {
    try {
      const { id } = ctx.params;
      console.log(`📡 PUT /api/task/${id}/complete chamado`);
      
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('You must be logged in to complete tasks.');
      }
      
      const existingTask = await strapi.entityService.findOne('api::task.task', id, {
        populate: ['user']
      });
      
      if (!existingTask) {
        return ctx.notFound('Task not found');
      }
      
      if (!existingTask.user || existingTask.user.id !== user.id) {
        console.log(`❌ Tentativa de conclusão não autorizada: Usuário ${user.id} tentou concluir tarefa ${id} do usuário ${existingTask.user?.id}`);
        return ctx.forbidden('You do not have permission to complete this task.');
      }
      
      const { data } = ctx.request.body;
      
      if (!data || !data.attributes) {
        return ctx.badRequest('Missing data.attributes');
      }
      
      const updatedTask = await strapi.entityService.update('api::task.task', id, {
        data: {
          completed: true,
          completedAt: data.attributes.completedAt || new Date().toISOString()
        }
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
            updatedAt: updatedTask.updatedAt,
            estimatedMinutes: updatedTask.estimatedMinutes || null
          }
        }
      };
    } catch (error) {
      console.error('❌ Erro em complete:', error);
      return ctx.internalServerError('Error completing task');
    }
  }
};
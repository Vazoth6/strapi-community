'use strict';

module.exports = {
  // Controlador para obter todas as tarefas do utilizador autenticado
  async find(ctx) {
    try {
      console.log(' GET /api/task chamado');
      
      const user = ctx.state.user;
      
      // Verificar autenticação do utilizador
      if (!user) {
        console.log(' Utilizador não autenticado');
        return ctx.unauthorized('Precisa de estar autenticado para visualizar tarefas.');
      }

      // Buscar tarefas do utilizador autenticado      
      console.log(` Utilizador autenticado: ${user.id} (${user.email})`);
      
      const tasks = await strapi.entityService.findMany('api::task.task', {
        filters: {
          user: user.id // Filtrar apenas tarefas do utilizador atual
        },
        sort: { createdAt: 'desc' }, // Ordenar por data de criação (mais recentes primeiro)
        populate: ['user'] // Incluir dados do utilizador associado
      });
      
      console.log(` ${tasks.length} tarefas encontradas para o utilizador ${user.id}`);
      
      // Formatar resposta no padrão JSON API      
      const data = tasks.map(task => ({
        id: task.id,
        attributes: {
          title: task.title || '',
          description: task.description || '',
          dueDate: task.dueDate,
          priority: task.priority || 'MEDIUM', // Valor padrão se não definido
          completed: task.completed || false,
          completedAt: task.completedAt,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          estimatedMinutes: task.estimatedMinutes || null,
          userId: task.user ? task.user.id : null // ID do utilizador dono da tarefa
        }
      }));
      
      return { data };
    } catch (error) {
      console.error(' Erro no find:', error.message, error.stack);
      return ctx.internalServerError(`Error: ${error.message}`);
    }
  },

  // Controlador para obter uma tarefa específica por ID
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      console.log(` GET /api/task/${id} chamado`);
      
      const user = ctx.state.user;

      // Verificar autenticação      
      if (!user) {
        return ctx.unauthorized('Para visualizar as tarefas é preiciso estar autenticado.');
      }
      
      // Buscar tarefa pelo ID com dados do utilizador
      const task = await strapi.entityService.findOne('api::task.task', id, {
        populate: ['user']
      });
      
      // Verificar se a tarefa existe
      if (!task) {
        return ctx.notFound('Task not found');
      }
      
      // Verificar se o utilizador atual é o dono da tarefa
      if (!task.user || task.user.id !== user.id) {
        console.log(` Tentativa de acesso não autorizado: Utilizador ${user.id} tentou acessar a tarefa ${id} do utilizador ${task.user?.id}`);
        return ctx.forbidden('Não tens permissão de visualizar a tarefa deste utilizador.');
      }
      
      // Retornar tarefa formatada
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
      console.error(' Erro em findOne:', error);
      return ctx.internalServerError('Erro ao efetuar fetch na tarefa.');
    }
  },

  // Controlador para criar uma nova tarefa
  async create(ctx) {
    try {
        console.log(' POST /api/task chamado');
        console.log(' Utilizador:', ctx.state.user);
        console.log(' Corpo:', JSON.stringify(ctx.request.body, null, 2));
        
        const user = ctx.state.user;
        
        // Verificar autenticação
        if (!user) {
            console.log(' Utilizador não autenticado');
            return ctx.unauthorized('Precisa de estar autenticado para criar tarefas.');
        }
        
        const { data } = ctx.request.body;
        
        // Validar estrutura dos dados recebidos
        if (!data || !data.attributes) {
            console.log(' Dados a faltar:', { data: data });
            return ctx.badRequest('data.attributes em falta.');
        }
        
        console.log(' Atributos recebidos:', data.attributes);
        
        // Log detalhado de cada campo recebido
        console.log(' Campos da tarefa:');
        console.log('- title:', data.attributes.title);
        console.log('- priority:', data.attributes.priority);
        console.log('- dueDate:', data.attributes.dueDate);
        console.log('- description:', data.attributes.description);
        console.log('- completed:', data.attributes.completed);
        console.log('- estimatedMinutes:', data.attributes.estimatedMinutes);
        
        // Validar o valor da prioridade
        const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];
        if (!validPriorities.includes(data.attributes.priority?.toUpperCase())) {
            console.log(' Prioridade inválida:', data.attributes.priority);
            return ctx.badRequest('Prioridade deve ser: LOW, MEDIUM, HIGH');
        }
        
        // Preparar dados da tarefa incluindo associação com utilizador
        const taskData = {
            ...data.attributes,
            user: user.id,
            priority: data.attributes.priority.toUpperCase() // Garantir maiúsculas
        };
        
        console.log(` A criar tarefa para o utilizador ${user.id}`);
        console.log(' Dados completos:', JSON.stringify(taskData, null, 2));
        
        // Criar a tarefa na base de dados
        const task = await strapi.entityService.create('api::task.task', {
            data: taskData
        });
        
        console.log(` Tarefa criada: ${task.id} - ${task.title} para o utilizador ${user.id}`);
        
        // Retornar tarefa criada formatada
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
        // Log detalhado do erro para debugging
        console.error(' Erro detalhado em create:');
        console.error('Mensagem:', error.message);
        console.error('Stack:', error.stack);
        console.error('Campo com erro:', error.details?.errors);
        
        return ctx.internalServerError(`Erro ao criar tarefa: ${error.message}`);
    }
},

  // Controlador para atualizar uma tarefa existente
  async update(ctx) {
    try {
      const { id } = ctx.params;
      console.log(` PUT /api/task/${id} chamado`);
      
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('Precisa de estar autenticado para atualizar tarefas.');
      }
      
      // Buscar tarefa existente para validação
      const existingTask = await strapi.entityService.findOne('api::task.task', id, {
        populate: ['user']
      });
      
      if (!existingTask) {
        return ctx.notFound('Tarefa não encontrada.');
      }
      
      // Verificar se o utilizador é o dono da tarefa
      if (!existingTask.user || existingTask.user.id !== user.id) {
        console.log(` Tentativa de atualização não autorizada: Utilizador ${user.id} tentou atualizar tarefa ${id} do utilizador ${existingTask.user?.id}`);
        return ctx.forbidden('Não tem permissão de atualizar a tarefa.');
      }
      
      const { data } = ctx.request.body;
      
      // Atualizar tarefa na base de dados
      if (!data || !data.attributes) {
        return ctx.badRequest('data.attributes em falta.');
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
      console.error(' Erro em update:', error);
      return ctx.internalServerError('Erro ao atualizar tarefa.');
    }
  },

  // Controlador para apagar uma tarefa
  async delete(ctx) {
    try {
      const { id } = ctx.params;
      console.log(` DELETE /api/task/${id} chamado`);
      
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('Precisa de estar autenticado para apagar tarefas.');
      }
      
      // Buscar tarefa para validação de propriedade
      const existingTask = await strapi.entityService.findOne('api::task.task', id, {
        populate: ['user']
      });
      
      if (!existingTask) {
        return ctx.notFound('Tarefa não encontrada');
      }
      
      // Verificar se o utilizador é o dono da tarefa
      if (!existingTask.user || existingTask.user.id !== user.id) {
        console.log(` Tentativa de exclusão não autorizada: Usuário ${user.id} tentou excluir tarefa ${id} do usuário ${existingTask.user?.id}`);
        return ctx.forbidden('Não tem permissão de apagar a tarefa.');
      }
      
      // Apagar tarefa da base de dados
      await strapi.entityService.delete('api::task.task', id);
      
      console.log(` Tarefa ${id} apagado pelo utilizador ${user.id}`);
      
      return { data: null }; // Resposta vazia indicando sucesso
    } catch (error) {
      console.error(' Erro em delete:', error);
      return ctx.internalServerError('Erro ao apagar tarefa.');
    }
  },

  // Controlador para marcar uma tarefa como completa
  async complete(ctx) {
    try {
      const { id } = ctx.params;
      console.log(` PUT /api/task/${id}/complete chamado`);
      
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('Precisa de estar autênticado para completar tarefas.');
      }
      
      // Buscar tarefa para validação
      const existingTask = await strapi.entityService.findOne('api::task.task', id, {
        populate: ['user']
      });
      
      if (!existingTask) {
        return ctx.notFound('Tarefa não encontrada');
      }
      
      // Verificar se o utilizador é o dono da tarefa
      if (!existingTask.user || existingTask.user.id !== user.id) {
        console.log(` Tentativa de conclusão não autorizada: Utilizador ${user.id} tentou concluir tarefa ${id} do utilizador ${existingTask.user?.id}`);
        return ctx.forbidden('Não tem permissão de completar a tarefa.');
      }
      
      const { data } = ctx.request.body;
      
      if (!data || !data.attributes) {
        return ctx.badRequest('data.attributes em falta.');
      }
      
      // Atualizar tarefa marcando como completa
      const updatedTask = await strapi.entityService.update('api::task.task', id, {
        data: {
          completed: true,
          completedAt: data.attributes.completedAt || new Date().toISOString() // Usar data fornecida ou atual
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
      console.error(' Erro em complete:', error);
      return ctx.internalServerError('Erro ao completar tarefa.');
    }
  }
};
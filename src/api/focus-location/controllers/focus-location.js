'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::focus-location.focus-location', ({ strapi }) => ({
  // Método para criar uma focus location
  async create(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('Utilizador não autenticado');
      }

      const { data } = ctx.request.body;
      
      if (!data) {
        return ctx.badRequest('Dados são obrigatórios');
      }

      // Adicionar o utilizador à localização
      const entry = await strapi.entityService.create('api::focus-location.focus-location', {
        data: {
          ...data,
          user: user.id
        },
        populate: ['user']
      });

      return this.transformResponse(entry);
    } catch (error) {
      strapi.log.error('Erro ao criar focus location:', error);
      return ctx.internalServerError('Erro ao criar localização');
    }
  },

  // Método para atualizar uma focus location
  async update(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('Utilizador não autenticado');
      }

      const { id } = ctx.params;
      const { data } = ctx.request.body;

      if (!data) {
        return ctx.badRequest('Dados são obrigatórios');
      }

      // Verificar se a localização pertence ao utilizador
      const existingLocation = await strapi.entityService.findOne(
        'api::focus-location.focus-location',
        id,
        { populate: ['user'] }
      );

      if (!existingLocation) {
        return ctx.notFound('Localização não encontrada');
      }

      if (existingLocation.user && existingLocation.user.id !== user.id) {
        return ctx.forbidden('Não tem permissão para editar esta localização');
      }

      // Atualizar a localização
      const entry = await strapi.entityService.update(
        'api::focus-location.focus-location',
        id,
        {
          data,
          populate: ['user']
        }
      );

      return this.transformResponse(entry);
    } catch (error) {
      strapi.log.error('Erro ao atualizar focus location:', error);
      return ctx.internalServerError('Erro ao atualizar localização');
    }
  },

  // Método para eliminar uma focus location
  async delete(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('Utilizador não autenticado');
      }

      const { id } = ctx.params;

      // Verificar se a localização pertence ao utilizador
      const existingLocation = await strapi.entityService.findOne(
        'api::focus-location.focus-location',
        id,
        { populate: ['user'] }
      );

      if (!existingLocation) {
        return ctx.notFound('Localização não encontrada');
      }

      if (existingLocation.user && existingLocation.user.id !== user.id) {
        return ctx.forbidden('Não tem permissão para eliminar esta localização');
      }

      // Eliminar a localização
      const entry = await strapi.entityService.delete(
        'api::focus-location.focus-location',
        id
      );

      return this.transformResponse(entry);
    } catch (error) {
      strapi.log.error('Erro ao eliminar focus location:', error);
      return ctx.internalServerError('Erro ao eliminar localização');
    }
  },

  // Método para obter todas as focus locations do utilizador
  async find(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('Utilizador não autenticado');
      }

      const { query } = ctx;

      // Filtrar apenas as localizações do utilizador
      const entries = await strapi.entityService.findMany('api::focus-location.focus-location', {
        ...query,
        filters: {
          ...query.filters,
          user: user.id
        },
        populate: ['user']
      });

      return this.transformResponse(entries);
    } catch (error) {
      strapi.log.error('Erro ao buscar focus locations:', error);
      return ctx.internalServerError('Erro ao buscar localizações');
    }
  },

  // Método para obter uma focus location específica
  async findOne(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('Utilizador não autenticado');
      }

      const { id } = ctx.params;

      // Buscar a localização
      const entry = await strapi.entityService.findOne(
        'api::focus-location.focus-location',
        id,
        {
          populate: ['user']
        }
      );

      if (!entry) {
        return ctx.notFound('Localização não encontrada');
      }

      // Verificar se a localização pertence ao utilizador
      if (entry.user && entry.user.id !== user.id) {
        return ctx.forbidden('Não tem permissão para ver esta localização');
      }

      return this.transformResponse(entry);
    } catch (error) {
      strapi.log.error('Erro ao buscar focus location:', error);
      return ctx.internalServerError('Erro ao buscar localização');
    }
  },

  // Método para alternar o estado enabled/disabled
  async toggle(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('Utilizador não autenticado');
      }

      const { id } = ctx.params;
      const { enabled } = ctx.request.body;

      if (typeof enabled !== 'boolean') {
        return ctx.badRequest('O campo "enabled" deve ser um booleano');
      }

      // Verificar se a localização pertence ao utilizador
      const existingLocation = await strapi.entityService.findOne(
        'api::focus-location.focus-location',
        id,
        { populate: ['user'] }
      );

      if (!existingLocation) {
        return ctx.notFound('Localização não encontrada');
      }

      if (existingLocation.user && existingLocation.user.id !== user.id) {
        return ctx.forbidden('Não tem permissão para alterar esta localização');
      }

      // Atualizar apenas o campo enabled
      const entry = await strapi.entityService.update(
        'api::focus-location.focus-location',
        id,
        {
          data: { enabled },
          populate: ['user']
        }
      );

      return this.transformResponse(entry);
    } catch (error) {
      strapi.log.error('Erro ao alternar focus location:', error);
      return ctx.internalServerError('Erro ao alternar estado da localização');
    }
  },

  // Método para obter as localizações ativas (enabled: true)
  async findActive(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('Utilizador não autenticado');
      }

      const { query } = ctx;

      // Filtrar apenas as localizações ativas do utilizador
      const entries = await strapi.entityService.findMany('api::focus-location.focus-location', {
        ...query,
        filters: {
          ...query.filters,
          user: user.id,
          enabled: true
        },
        populate: ['user']
      });

      return this.transformResponse(entries);
    } catch (error) {
      strapi.log.error('Erro ao buscar focus locations ativas:', error);
      return ctx.internalServerError('Erro ao buscar localizações ativas');
    }
  }
}));
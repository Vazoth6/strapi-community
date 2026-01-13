'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::focus-location.focus-location', ({ strapi }) => ({
  // Método para criar uma focus location
  async create(ctx) {
    try {
      console.log('=== CREATE FOCUS LOCATION ===');
      console.log('Request body:', JSON.stringify(ctx.request.body, null, 2));
      console.log('User ID:', ctx.state.user?.id);
      
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('Utilizador não autenticado');
      }

      const { data } = ctx.request.body;
      
      if (!data) {
        return ctx.badRequest('Dados são obrigatórios');
      }

      // Extrair dados
      let locationData;
      if (data.attributes) {
        locationData = data.attributes;
      } else if (data.data && data.data.attributes) {
        locationData = data.data.attributes;
      } else {
        locationData = data;
      }

      console.log('Location data extracted:', JSON.stringify(locationData, null, 2));

      // **CRÍTICO: Converter os tipos corretamente para o Strapi**
      const createData = {
        name: String(locationData.name || ''),
        address: String(locationData.address || ''),
        latitude: parseFloat(locationData.latitude).toFixed(6), // Converter para string com 6 decimais
        longitude: parseFloat(locationData.longitude).toFixed(6),
        radius: parseFloat(locationData.radius || 100),
        enabled: Boolean(locationData.enabled !== false), // default true
        notificationMessage: String(locationData.notificationMessage || 'Vamos pôr as mãos ao trabalho!'),
        user: user.id
      };

      console.log('Processed data for creation:', JSON.stringify(createData, null, 2));

      // Validar campos obrigatórios
      if (!createData.name || createData.name.trim() === '') {
        return ctx.badRequest('O campo "name" é obrigatório');
      }
      if (!createData.address || createData.address.trim() === '') {
        return ctx.badRequest('O campo "address" é obrigatório');
      }
      if (isNaN(createData.latitude) || createData.latitude < -90 || createData.latitude > 90) {
        return ctx.badRequest('Latitude inválida');
      }
      if (isNaN(createData.longitude) || createData.longitude < -180 || createData.longitude > 180) {
        return ctx.badRequest('Longitude inválida');
      }
      if (isNaN(createData.radius) || createData.radius < 10 || createData.radius > 1000) {
        return ctx.badRequest('Raio deve estar entre 10 e 1000 metros');
      }

      // Criar a localização
      console.log('Attempting to create with entityService...');
      const entry = await strapi.entityService.create('api::focus-location.focus-location', {
        data: createData,
        populate: ['user']
      });

      console.log('✅ Entry created successfully:', entry.id);
      return this.transformResponse(entry);
      
    } catch (error) {
      console.error('❌ Erro completo ao criar focus location:', error);
      
      // Log detalhado dos erros de validação
      if (error.details?.errors) {
        console.error('📋 Validation errors details:');
        error.details.errors.forEach((err, index) => {
          console.error(`  Error ${index + 1}:`);
          console.error(`    Path: ${err.path}`);
          console.error(`    Message: ${err.message}`);
          console.error(`    Type: ${err.type}`);
          if (err.params) console.error(`    Params:`, err.params);
          if (err.value !== undefined) console.error(`    Value:`, err.value);
        });
      }
      
      strapi.log.error('Erro ao criar focus location:', error);
      return ctx.internalServerError(`Erro ao criar localização: ${error.message || 'Erro de validação'}`);
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

      let locationData;
      if (data.attributes) {
        locationData = data.attributes;
      } else {
        locationData = data;
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
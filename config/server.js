module.exports = ({ env }) => ({
  // Endereço de hospedagem do servidor
  host: env('HOST', '0.0.0.0'), // Aceita conexões de qualquer interface

  // Porta onde o servidor vai correr
  port: env.int('PORT', 1337),

  // Configuração da aplicação
  app: {
    // Chaves para assinatura de cookies e sessões
    keys: env.array('APP_KEYS'),
  },

  // Configuração de webhooks
  webhooks: {
    // Controla se as relações são populadas nos payloads dos webhooks
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});

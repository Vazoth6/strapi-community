module.exports = ({ env }) => ({
  // Plugin de Users & Permissions (gestão de utilizadores e autenticação)
  'users-permissions': {
    config: {
      // Segredo para assinatura de tokens JWT (deve estar no .env)
      jwtSecret: env('JWT_SECRET'),
      // Configuração dos tokens JWT
      jwt: {
        expiresIn: '7d', // Tokens expiram após 7 dias
      },
      // Configuração do registo de novos utilizadores
      register: {
        allowedFields: ['username', 'email'], // Campos permitidos no registo
      },
      // Configuração de email (usando sendmail como fallback)
      email: {
        config: {
          provider: 'sendmail', // Usar sendmail para desenvolvimento
          providerOptions: {},
          settings: {
            defaultFrom: 'no-reply@localhost', // Remetente padrão
            defaultReplyTo: 'no-reply@localhost', // Endereço para resposta
          },
        },
      },
      // Configuração de confirmação por email desativada
      emailConfirmation: {
        enabled: false,
      },
    },
  },
});
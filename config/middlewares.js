module.exports = [
  // Middleware para tratamento de erros padrão do Strapi
  'strapi::errors',

  // Middleware de segurança com Content Security Policy personalizada
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true, // Usar configurações padrão do Strapi
        directives: {
          // Permitir conexões com diversas origens (flexível para desenvolvimento)
          'connect-src': ["'self'", 'https:', 'http:'],
          // Permitir carregamento de imagens de múltiplas fontes
          'img-src': ["'self'", 'data:', 'blob:', 'https:'],
        },
      },
    },
  },

  // Middleware CORS para controlar acesso cross-origin
  {
    name: 'strapi::cors',
    config: {
      // Origens permitidas para fazer requests à API
      origin: [
        'http://localhost:1337', // Strapi admin local
        'http://localhost:3000',  // Aplicação web local (Android Studio vista web)
        'http://10.0.2.2:1337',   // Emulador Android (endereço especial)
      ],
      // Métodos HTTP permitidos
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      // Headers permitidos nos requests
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      // Permitir envio de credenciais (cookies, autenticação)
      credentials: true,
      // Manter headers CORS mesmo em respostas de erro
      keepHeaderOnError: true,
    },
  },
  
  // Middlewares padrão do Strapi (executados na ordem definida):
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
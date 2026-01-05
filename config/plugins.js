// config/plugins.js
module.exports = ({ env }) => ({
  // ... other plugins
  'users-permissions': {
    config: {
      jwtSecret: env('JWT_SECRET'),
      jwt: {
        expiresIn: '7d',
      },
      register: {
        allowedFields: ['username', 'email'],
      },
      // Disable email for now to test
      email: {
        config: {
          provider: 'sendmail', // or 'nodemailer'
          providerOptions: {},
          settings: {
            defaultFrom: 'no-reply@localhost',
            defaultReplyTo: 'no-reply@localhost',
          },
        },
      },
      emailConfirmation: {
        enabled: false,
      },
    },
  },
});
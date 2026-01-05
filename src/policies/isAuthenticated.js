'use strict';

module.exports = (policyContext, config, { strapi }) => {
  // Verificar se há um usuário autenticado
  if (policyContext.state.user) {
    return true;
  }

  // Se não houver usuário autenticado, negar o acesso
  return false;
};
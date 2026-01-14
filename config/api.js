module.exports = {
  rest: {
    defaultLimit: 25, // Limite padrão de itens por página
    maxLimit: 100, // Limite máximo permitido (para evitar sobrecarga)
    withCount: true, // Incluir contagem total de resultados nas respostas
  },
};
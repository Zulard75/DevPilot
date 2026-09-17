export const getHealthController = (_request, response) => {
  response.json({ status: 'ok', service: 'api' });
};
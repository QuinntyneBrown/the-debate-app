const idParam = { name: 'id', in: 'query', required: true, schema: { type: 'integer' } };
const ok = { 200: { description: 'OK' } };
const secured = [{ bearerAuth: [] }];

const meetingDto = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    date: { type: 'string', example: '2024-05-01' },
    start: { type: 'string' },
    end: { type: 'string' },
    abstract: { type: 'string' },
    agenda: { type: 'string' },
    minutes: { type: 'string' },
  },
};

const userDto = { type: 'object', properties: { id: { type: 'integer' }, name: { type: 'string' } } };

const crudPaths = (base: string, tag: string, schema: object) => ({
  [`${base}/add`]: { post: { tags: [tag], security: secured, requestBody: { content: { 'application/json': { schema } } }, responses: { ...ok, 401: { description: 'Unauthorized' } } } },
  [`${base}/update`]: { put: { tags: [tag], security: secured, requestBody: { content: { 'application/json': { schema } } }, responses: { ...ok, 401: { description: 'Unauthorized' } } } },
  [`${base}/get`]: { get: { tags: [tag], responses: ok } },
  [`${base}/getById`]: { get: { tags: [tag], security: secured, parameters: [idParam], responses: { ...ok, 401: { description: 'Unauthorized' }, 404: { description: 'Not found' } } } },
  [`${base}/remove`]: { delete: { tags: [tag], security: secured, parameters: [idParam], responses: { ...ok, 401: { description: 'Unauthorized' }, 404: { description: 'Not found' } } } },
});

const namedDto = (field: string) => ({ type: 'object', properties: { id: { type: 'integer' }, [field]: { type: 'string' } } });

export const openApiDocument = {
  openapi: '3.0.0',
  info: { title: 'TheDebateApp', version: 'v1' },
  paths: {
    '/api/meeting/add': { post: { tags: ['meeting'], requestBody: { content: { 'application/json': { schema: meetingDto } } }, responses: ok } },
    '/api/meeting/update': { put: { tags: ['meeting'], requestBody: { content: { 'application/json': { schema: meetingDto } } }, responses: ok } },
    '/api/meeting/get': { get: { tags: ['meeting'], responses: ok } },
    '/api/meeting/getById': { get: { tags: ['meeting'], parameters: [idParam], responses: { ...ok, 404: { description: 'Not found' } } } },
    '/api/meeting/remove': { delete: { tags: ['meeting'], parameters: [idParam], responses: { ...ok, 404: { description: 'Not found' } } } },
    ...crudPaths('/api/article', 'article', namedDto('title')),
    ...crudPaths('/api/architecture', 'architecture', namedDto('name')),
    ...crudPaths('/api/architectureItem', 'architectureItem', namedDto('name')),
    ...crudPaths('/api/digitalasset', 'digitalAsset', namedDto('name')),
    '/api/digitalasset/upload': {
      post: {
        tags: ['digitalAsset'],
        requestBody: { content: { 'multipart/form-data': { schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } } } },
        responses: { 200: { description: 'Stored files: { files: [{ id, name }] }' } },
      },
    },
    '/api/digitalasset/serve': {
      get: {
        tags: ['digitalAsset'],
        parameters: [
          { name: 'uniqueId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'name', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Raw bytes with the stored content type; cached 1000 s. Empty when no live asset matches.' } },
      },
    },
    '/api/user/token': {
      post: {
        tags: ['user'],
        requestBody: {
          content: {
            'application/x-www-form-urlencoded': {
              schema: {
                type: 'object',
                properties: { grant_type: { type: 'string', example: 'password' }, username: { type: 'string' }, password: { type: 'string' } },
              },
            },
          },
        },
        responses: { ...ok, 400: { description: 'OAuth error' } },
      },
    },
    '/api/user/current': { get: { tags: ['user'], responses: ok } },
    '/api/user/get': { get: { tags: ['user'], responses: ok } },
    '/api/user/getById': { get: { tags: ['user'], security: secured, parameters: [idParam], responses: { ...ok, 401: { description: 'Unauthorized' }, 404: { description: 'Not found' } } } },
    '/api/user/add': { post: { tags: ['user'], security: secured, requestBody: { content: { 'application/json': { schema: userDto } } }, responses: { ...ok, 401: { description: 'Unauthorized' } } } },
    '/api/user/update': { put: { tags: ['user'], security: secured, requestBody: { content: { 'application/json': { schema: userDto } } }, responses: { ...ok, 401: { description: 'Unauthorized' } } } },
    '/api/user/remove': { delete: { tags: ['user'], security: secured, parameters: [idParam], responses: { ...ok, 401: { description: 'Unauthorized' }, 404: { description: 'Not found' } } } },
  },
  components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
};

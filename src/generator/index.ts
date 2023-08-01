import {merge} from 'lodash';
import {JsonObject} from 'swagger-ui-express';
import {SanitizedConfig} from 'payload/dist/config/types';

import {
    MeResponseGenerator,
    ErrorResponseGenerator,
    LoginResponseGenerator,
    MessageResponseGenerator,
    PaginationResponseGenerator,
} from './responses';
import {CREATE_DTO_NAME_SUFFIX, UPDATE_DTO_NAME_SUFFIX} from './constants';
import {EntryDtoGenerator, LoginDtoGenerator} from './dto';
import {PayloadHelper, SwaggerHelper} from './helpers';
import {ParametersGenerator} from './parameters';
import {CollectionConfig} from 'payload/types';
import {EntryGenerator} from './entry';

export type SwaggerGeneratorOptions = {
    collections: CollectionConfig['slug'][];
    locale?: string;
};

export class SwaggerGenerator {
    static generate(config: SanitizedConfig, options?: SwaggerGeneratorOptions): JsonObject {
        const locale = options?.locale ?? 'en';
        const swagger: JsonObject = {
            openapi: '3.0.3',
            info: {
                title: `${['Swagger', config.admin.meta.titleSuffix.trim()]
                    .filter((v) => v.length > 1)
                    .join(' ')} API - OpenAPI 3.0`,
                version: process.env.VERSION || '0.0.1',
            },
            tags: [],
            paths: {},
            externalDocs: {
                description: 'Payload REST API Overview',
                url: 'https://payloadcms.com/docs/rest-api/overview',
            },
            components: {
                securitySchemes: {
                    cookieAuth: {
                        in: 'cookie',
                        type: 'apiKey',
                        name: `${config.cookiePrefix || 'payload'}-token`,
                    },
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    },
                },
                schemas: {},
            },
        };

        const errorResponse = ErrorResponseGenerator.generate();
        const messageResponse = MessageResponseGenerator.generate();
        swagger.components.schemas[errorResponse.name] = errorResponse.scheme;
        swagger.components.schemas[messageResponse.name] = messageResponse.scheme;

        config.collections.forEach((collection) => {
            if (typeof options?.collections !== 'undefined') {
                if (options.collections.length > 0 && !options.collections.includes(collection.slug)) {
                    // skip
                    return;
                }
            }
            if (collection.admin?.description) {
                const description = PayloadHelper.extractStringByLocale(collection.admin?.description, locale);
                if (description) {
                    swagger.tags.push({
                        name: collection.slug,
                        description,
                    });
                }
            }

            const tags = [collection.slug];
            const entry = EntryGenerator.generate(collection, {locale});
            const createDto = EntryDtoGenerator.generate(collection, {operation: 'create', locale});
            const updateDto = EntryDtoGenerator.generate(collection, {operation: 'update', locale});
            const paginationResponse = PaginationResponseGenerator.generate(collection);

            swagger.components.schemas[paginationResponse.name] = paginationResponse.scheme;
            swagger.components.schemas[createDto.name] = createDto.scheme;
            swagger.components.schemas[updateDto.name] = updateDto.scheme;
            swagger.components.schemas[entry.name] = entry.scheme;

            const withDraftQuery =
                Boolean(collection.versions) &&
                typeof collection.versions === 'object' &&
                Boolean(collection.versions?.drafts);

            // get, post
            swagger.paths[`/api/${collection.slug}`] = {
                get: {
                    tags,
                    summary: 'Find paginated documents',
                    parameters: ParametersGenerator.generate({
                        withBasicQuery: true,
                        withFindQuery: true,
                        withDraftQuery,
                    }),
                    operationId: SwaggerHelper.operationIdFromSlug(collection.slug, 'find'),
                    responses: {
                        ['200']: {
                            description: 'Success',
                            content: {
                                ['application/json']: {
                                    schema: {
                                        $ref: SwaggerHelper.componentRef(paginationResponse.name),
                                    },
                                },
                            },
                        },
                    },
                },
                post: {
                    tags,
                    summary: 'Create a new document',
                    parameters: ParametersGenerator.generate({
                        withDraftQuery,
                    }),
                    operationId: SwaggerHelper.operationIdFromSlug(collection.slug, 'create'),
                    requestBody: {
                        required: true,
                        content: {
                            ...(Boolean(collection.upload)
                                ? {
                                      ['multipart/form-data']: {
                                          schema: {
                                              type: 'object',
                                              properties: {
                                                  file: {
                                                      type: 'array',
                                                      items: {
                                                          type: 'string',
                                                          format: 'binary',
                                                      },
                                                  },
                                              },
                                          },
                                      },
                                  }
                                : {}),
                            ['application/json']: {
                                schema: {
                                    $ref: SwaggerHelper.componentRef(
                                        SwaggerHelper.nameFromSlug(collection.slug, CREATE_DTO_NAME_SUFFIX),
                                    ),
                                },
                            },
                        },
                    },
                    responses: {
                        ['201']: {
                            description: 'Success',
                            content: {
                                ['application/json']: {
                                    schema: {
                                        $ref: SwaggerHelper.componentRef(entry.name),
                                    },
                                },
                            },
                        },
                    },
                },
            };

            // get, patch, delete by id
            swagger.paths[`/api/${collection.slug}/{id}`] = {
                get: {
                    tags,
                    summary: 'Find a specific document by ID',
                    parameters: ParametersGenerator.generate({
                        withDraftQuery,
                        withBasicQuery: true,
                        withFindQuery: true,
                        pathParams: ['id'],
                    }),
                    operationId: SwaggerHelper.operationIdFromSlug(collection.slug, 'getById'),
                    responses: {
                        ['200']: {
                            description: 'Success',
                            content: {
                                ['application/json']: {
                                    schema: {
                                        $ref: SwaggerHelper.componentRef(entry.name),
                                    },
                                },
                            },
                        },
                        ['404']: {
                            description: 'Document not found',
                            content: {
                                ['application/json']: {
                                    schema: {
                                        $ref: SwaggerHelper.componentRef(errorResponse.name),
                                    },
                                },
                            },
                        },
                    },
                },
                patch: {
                    tags,
                    summary: 'Update a document by ID',
                    parameters: ParametersGenerator.generate({
                        withDraftQuery,
                        withBasicQuery: true,
                        pathParams: ['id'],
                    }),
                    operationId: SwaggerHelper.operationIdFromSlug(collection.slug, 'updateById'),
                    requestBody: {
                        required: true,
                        content: {
                            ['application/json']: {
                                schema: {
                                    $ref: SwaggerHelper.componentRef(
                                        SwaggerHelper.nameFromSlug(collection.slug, UPDATE_DTO_NAME_SUFFIX),
                                    ),
                                },
                            },
                        },
                    },
                    responses: {
                        ['200']: {
                            description: 'Success',
                            content: {
                                ['application/json']: {
                                    schema: {
                                        $ref: SwaggerHelper.componentRef(entry.name),
                                    },
                                },
                            },
                        },
                        ['404']: {
                            description: 'Document not found',
                            content: {
                                ['application/json']: {
                                    schema: {
                                        $ref: SwaggerHelper.componentRef(errorResponse.name),
                                    },
                                },
                            },
                        },
                    },
                },
                delete: {
                    tags,
                    summary: 'Delete an existing document by ID',
                    parameters: ParametersGenerator.generate({
                        withDraftQuery,
                        withBasicQuery: true,
                        pathParams: ['id'],
                    }),
                    operationId: SwaggerHelper.operationIdFromSlug(collection.slug, 'deleteById'),
                    responses: {
                        ['404']: {
                            description: 'Document not found',
                            content: {
                                ['application/json']: {
                                    schema: {
                                        $ref: SwaggerHelper.componentRef(errorResponse.name),
                                    },
                                },
                            },
                        },
                    },
                },
            };

            // versions api
            if (Boolean(collection.versions)) {
                const versionEntry = EntryGenerator.generate(collection, {locale, versionEntry: true});
                const versionPaginationResponse = PaginationResponseGenerator.generate(collection, {
                    docsComponentName: versionEntry.name,
                    prefix: 'Versions',
                });

                swagger.components.schemas[versionEntry.name] = versionEntry.scheme;
                swagger.components.schemas[versionPaginationResponse.name] = versionPaginationResponse.scheme;

                swagger.paths[`/api/${collection.slug}/versions`] = {
                    get: {
                        tags,
                        summary: 'Find and query paginated versions',
                        parameters: ParametersGenerator.generate({
                            withBasicQuery: true,
                            withFindQuery: true,
                        }),
                        operationId: SwaggerHelper.operationIdFromSlug(collection.slug, 'findVersions'),
                        responses: {
                            ['200']: {
                                description: 'Success',
                                content: {
                                    ['application/json']: {
                                        schema: {
                                            $ref: SwaggerHelper.componentRef(versionPaginationResponse.name),
                                        },
                                    },
                                },
                            },
                        },
                    },
                };
                swagger.paths[`/api/${collection.slug}/versions/{id}`] = {
                    get: {
                        tags,
                        summary: 'Find a specific version by ID',
                        parameters: ParametersGenerator.generate({
                            withBasicQuery: true,
                            pathParams: ['id'],
                        }),
                        operationId: SwaggerHelper.operationIdFromSlug(collection.slug, 'getVersionById'),
                        responses: {
                            ['200']: {
                                description: 'Success',
                                content: {
                                    ['application/json']: {
                                        schema: {
                                            $ref: SwaggerHelper.componentRef(versionEntry.name),
                                        },
                                    },
                                },
                            },
                        },
                    },
                    post: {
                        tags,
                        summary: 'Restore a version by ID',
                        parameters: ParametersGenerator.generate({
                            withBasicQuery: true,
                            pathParams: ['id'],
                        }),
                        operationId: SwaggerHelper.operationIdFromSlug(collection.slug, 'restoreVersionById'),
                        responses: {
                            ['200']: {
                                description: 'Success',
                                content: {
                                    ['application/json']: {
                                        schema: {
                                            $ref: SwaggerHelper.componentRef(versionEntry.name),
                                        },
                                    },
                                },
                            },
                        },
                    },
                };
            }

            // custom endpoints
            if ((collection.endpoints?.length ?? 0) > 0) {
                for (const endpoint of collection.endpoints) {
                    const key = `/api/${collection.slug}/${endpoint.path}`;
                    swagger.paths[key] = {
                        ...swagger.paths[key],
                        [endpoint.method]: {
                            ...(endpoint.custom ?? {}).swagger,
                            tags,
                        },
                    };
                }
            }

            // auth
            if (collection.auth) {
                const loginDto = LoginDtoGenerator.generate(collection);
                const meResponse = MeResponseGenerator.generate(collection);
                const loginResponse = LoginResponseGenerator.generate(collection);
                swagger.components.schemas[loginDto.name] = loginDto.scheme;
                swagger.components.schemas[meResponse.name] = meResponse.scheme;
                swagger.components.schemas[loginResponse.name] = loginResponse.scheme;
                swagger.paths[`/api/${collection.slug}/me`] = {
                    get: {
                        tags,
                        summary: 'Returns the currently logged in user with token',
                        operationId: SwaggerHelper.operationIdFromSlug(collection.slug, 'getMe'),
                        responses: {
                            ['200']: {
                                description: 'Success',
                                content: {
                                    ['application/json']: {
                                        schema: {
                                            $ref: SwaggerHelper.componentRef(meResponse.name),
                                        },
                                    },
                                },
                            },
                            ['401']: {
                                description: 'Unauthorized',
                                content: {
                                    ['application/json']: {
                                        schema: {
                                            $ref: SwaggerHelper.componentRef(errorResponse.name),
                                        },
                                    },
                                },
                            },
                        },
                    },
                };
                swagger.paths[`/api/${collection.slug}/login`] = {
                    post: {
                        tags,
                        summary: 'Logs in a user with email / password',
                        operationId: SwaggerHelper.operationIdFromSlug(collection.slug, 'login'),
                        requestBody: {
                            required: true,
                            content: {
                                ['application/json']: {
                                    schema: {
                                        $ref: SwaggerHelper.componentRef(loginDto.name),
                                    },
                                },
                            },
                        },
                        responses: {
                            ['200']: {
                                description: 'Success',
                                content: {
                                    ['application/json']: {
                                        schema: {
                                            $ref: SwaggerHelper.componentRef(loginResponse.name),
                                        },
                                    },
                                },
                            },
                            ['401']: {
                                description: 'Unauthorized',
                                content: {
                                    ['application/json']: {
                                        schema: {
                                            $ref: SwaggerHelper.componentRef(errorResponse.name),
                                        },
                                    },
                                },
                            },
                        },
                    },
                };
                swagger.paths[`/api/${collection.slug}/logout`] = {
                    post: {
                        tags,
                        summary: 'Logs out a user.',
                        operationId: SwaggerHelper.operationIdFromSlug(collection.slug, 'logout'),
                        responses: {
                            ['204']: {
                                description: 'Success logout without response data',
                            },
                            ['200']: {
                                description: 'Success logout',
                                content: {
                                    ['application/json']: {
                                        schema: {
                                            $ref: SwaggerHelper.componentRef(messageResponse.name),
                                        },
                                    },
                                },
                            },
                            ['401']: {
                                description: 'Unauthorized',
                                content: {
                                    ['application/json']: {
                                        schema: {
                                            $ref: SwaggerHelper.componentRef(errorResponse.name),
                                        },
                                    },
                                },
                            },
                        },
                    },
                };
            }

            // custom
            merge(swagger, (collection.custom ?? {}).swagger ?? {});
        });

        return swagger;
    }
}

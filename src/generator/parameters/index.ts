import {JsonObject} from 'swagger-ui-express';

export type ParametersGenerateOptions = {
    pathParams?: string[];
    withFindQuery?: boolean;
    withBasicQuery?: boolean;
    withDraftQuery?: boolean;
};

export class ParametersGenerator {
    static generate(options: ParametersGenerateOptions): JsonObject[] {
        const result: JsonObject[] = [];
        options?.pathParams?.forEach((name) => {
            result.push({
                in: 'path',
                name,
                required: true,
                schema: {
                    type: 'string',
                },
            });
        });
        if (options.withDraftQuery) {
            result.push({
                in: 'query',
                name: 'draft',
                schema: {
                    type: 'boolean',
                    nullable: true,
                },
            });
        }
        if (options?.withBasicQuery) {
            result.push(
                {
                    in: 'query',
                    name: 'depth',
                    description: 'automatically populates relationships and uploads',
                    schema: {
                        type: 'number',
                        format: 'int64',
                        nullable: true,
                    },
                },
                {
                    in: 'query',
                    name: 'locale',
                    description: 'retrieves document(s) in a specific `locale`',
                    schema: {
                        type: 'string',
                        nullable: true,
                    },
                },
                {
                    in: 'query',
                    name: 'fallback-locale',
                    description: 'specifies a fallback `locale` if no locale value exists',
                    schema: {
                        type: 'string',
                        nullable: true,
                    },
                },
            );
        }
        if (options.withFindQuery) {
            result.push(
                {
                    in: 'query',
                    name: 'sort',
                    description: '`sort` by field',
                    schema: {
                        type: 'string',
                    },
                },
                {
                    in: 'query',
                    name: 'limit',
                    description: '`limit` the returned documents to a certain number',
                    schema: {
                        type: 'number',
                        format: 'int64',
                    },
                },
                {
                    in: 'query',
                    name: 'page',
                    description: 'get a specific `page` of documents',
                    schema: {
                        type: 'number',
                        format: 'int64',
                    },
                },
                {
                    in: 'query',
                    name: 'additional',
                    description:
                        'additional `query` parameters (can override query), see [where in rest-queries](https://payloadcms.com/docs/queries/overview#rest-queries)',
                    schema: {
                        type: 'object',
                        required: ['where'],
                        properties: {
                            where: {
                                type: 'object',
                            },
                        },
                    },
                },
            );
        }
        return result;
    }
}

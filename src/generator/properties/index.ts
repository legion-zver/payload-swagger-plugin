import {Field} from 'payload/types';
import {assign} from 'lodash';
import {JsonObject} from 'swagger-ui-express';

import {PayloadHelper, SwaggerHelper} from '../helpers';
import {ENTRY_NAME_SUFFIX} from '../constants';

export interface PropertiesGenerateOptions {
    flatRelationships?: boolean;
    locale?: string;
}

export class PropertiesGenerator {
    static generate(fields: Field[], options?: PropertiesGenerateOptions): JsonObject {
        const result: JsonObject = {};
        fields.forEach((field) => {
            if ('hidden' in field && field.hidden) {
                return;
            }
            if ('name' in field) {
                if (field.name === 'password') {
                    return;
                }
                const schema: JsonObject = {
                    ...(field.label
                        ? {
                              description: PayloadHelper.extractStringByLocale(field.label, options?.locale || 'en'),
                          }
                        : {}),
                };
                if ('required' in field && field.required) {
                    if (field.required) {
                        schema.required = true;
                    } else {
                        schema.nullable = true;
                    }
                }
                // https://payloadcms.com/docs/fields
                switch (field.type) {
                    case 'text':
                    case 'code':
                    case 'email':
                    case 'textarea':
                        schema.type = 'string';
                        break;

                    case 'date':
                        schema.type = 'string';
                        schema.example = new Date().toISOString();
                        break;

                    case 'radio':
                    case 'select':
                        const selectSchema = {
                            type: 'string',
                            enum: field.options.map((option) => (typeof option === 'string' ? option : option.value)),
                        };
                        if ('hasMany' in field && field.hasMany) {
                            schema.type = 'array';
                            schema.items = selectSchema;
                        } else {
                            assign(schema, selectSchema);
                        }
                        break;

                    case 'number':
                        schema.type = 'number';
                        break;

                    case 'checkbox':
                        schema.type = 'boolean';
                        break;

                    case 'richText':
                        schema.type = 'array';
                        schema.items = {
                            type: 'object',
                        };
                        break;

                    case 'json':
                        schema.oneOf = [
                            {type: 'null'},
                            {type: 'array'},
                            {type: 'string'},
                            {type: 'number'},
                            {type: 'boolean'},
                            {type: 'object', format: 'json'},
                        ];
                        break;

                    case 'point':
                        schema.type = 'array';
                        schema.minItems = 2;
                        schema.maxItems = 2;
                        schema.items = [
                            {
                                type: 'number',
                            },
                            {
                                type: 'number',
                            },
                        ];
                        break;

                    case 'upload':
                    case 'relationship':
                        if (Array.isArray(field.relationTo)) {
                            break;
                        }
                        if ('hasMany' in field && field.hasMany) {
                            schema.type = 'array';
                            schema.uniqueItems = true;
                            if (options?.flatRelationships) {
                                schema.items = {
                                    type: 'string',
                                };
                            } else {
                                schema.items = {
                                    allOf: [
                                        {type: 'string'},
                                        {
                                            $ref: SwaggerHelper.componentRef(
                                                SwaggerHelper.nameFromSlug(field.relationTo, ENTRY_NAME_SUFFIX),
                                            ),
                                        },
                                    ],
                                };
                            }
                        } else {
                            if (options?.flatRelationships) {
                                schema.type = 'string';
                            } else {
                                schema.allOf = [
                                    {type: 'string'},
                                    {
                                        $ref: SwaggerHelper.componentRef(
                                            SwaggerHelper.nameFromSlug(field.relationTo, ENTRY_NAME_SUFFIX),
                                        ),
                                    },
                                ];
                            }
                        }
                        break;

                    case 'array':
                        schema.type = 'array';
                        schema.items = {
                            type: 'object',
                            properties: PropertiesGenerator.generate(field.fields, options),
                        };
                        break;

                    case 'group':
                        schema.type = 'object';
                        schema.properties = PropertiesGenerator.generate(field.fields, options);
                        break;
                }
                result[field.name] = schema;
            } else if (field.type === 'row' || field.type === 'collapsible') {
                assign(result, PropertiesGenerator.generate(field.fields, options));
            }
        });
        return result;
    }
}

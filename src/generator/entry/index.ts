import {ObjectId} from 'mongodb';
import {SanitizedCollectionConfig} from 'payload/types';

import {ENTRY_NAME_SUFFIX, VERSION_ENTRY_NAME_SUFFIX} from '../constants';
import {PropertiesGenerator} from '../properties';
import {SwaggerComponent} from '../types';
import {SwaggerHelper} from '../helpers';

export interface EntryGenerateOptions {
    versionEntry?: boolean;
    locale?: string;
}

export class EntryGenerator {
    static generate(collection: SanitizedCollectionConfig, options?: EntryGenerateOptions): SwaggerComponent {
        if (options?.versionEntry) {
            return {
                name: SwaggerHelper.nameFromSlug(collection.slug, VERSION_ENTRY_NAME_SUFFIX),
                scheme: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            example: new ObjectId().toString(),
                            description: 'Document ID',
                        },
                        parent: {
                            type: 'string',
                            example: new ObjectId().toString(),
                            description: 'Document ID',
                        },
                        version: {
                            type: 'object',
                            properties: PropertiesGenerator.generate(
                                collection.fields,
                                options?.locale
                                    ? {
                                          locale: options.locale,
                                      }
                                    : {},
                            ),
                        },
                        createdAt: {
                            type: 'string',
                            example: new Date().toISOString(),
                        },
                        updatedAt: {
                            type: 'string',
                            example: new Date().toISOString(),
                        },
                    },
                },
            };
        }
        return {
            name: SwaggerHelper.nameFromSlug(collection.slug, ENTRY_NAME_SUFFIX),
            scheme: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        example: new ObjectId().toString(),
                        description: 'Document ID',
                    },
                    ...PropertiesGenerator.generate(
                        collection.fields,
                        options?.locale
                            ? {
                                  locale: options.locale,
                              }
                            : {},
                    ),
                    ...(collection.timestamps
                        ? {
                              createdAt: {
                                  type: 'string',
                                  example: new Date().toISOString(),
                              },
                              updatedAt: {
                                  type: 'string',
                                  example: new Date().toISOString(),
                              },
                              deletedAt: {
                                  type: 'string',
                                  example: null,
                                  nullable: true,
                              },
                          }
                        : {}),
                },
            },
        };
    }
}

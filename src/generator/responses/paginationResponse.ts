import {SanitizedCollectionConfig} from 'payload/types';

import {ENTRY_NAME_SUFFIX, PAGINATION_RESPONSE_NAME_SUFFIX} from '../constants';
import {SwaggerComponent} from '../types';
import {SwaggerHelper} from '../helpers';

export interface PaginationResponseGenerateOptions {
    docsComponentName?: string;
    prefix?: string;
}

export class PaginationResponseGenerator {
    static generate(
        collection: SanitizedCollectionConfig,
        options?: PaginationResponseGenerateOptions,
    ): SwaggerComponent {
        return {
            name: SwaggerHelper.nameFromSlug(
                collection.slug,
                `${options?.prefix || ''}${PAGINATION_RESPONSE_NAME_SUFFIX}`,
            ),
            scheme: {
                type: 'object',
                properties: {
                    docs: {
                        type: 'array',
                        items: {
                            $ref: SwaggerHelper.componentRef(
                                options?.docsComponentName ??
                                    SwaggerHelper.nameFromSlug(collection.slug, ENTRY_NAME_SUFFIX),
                            ),
                        },
                    },
                    hasPrevPage: {
                        type: 'boolean',
                        example: false,
                    },
                    hasNextPage: {
                        type: 'boolean',
                        example: false,
                    },
                    prevPage: {
                        nullable: true,
                        example: null,
                        type: 'string',
                    },
                    nextPage: {
                        nullable: true,
                        example: null,
                        type: 'string',
                    },
                    pagingCounter: {
                        type: 'number',
                        example: 1,
                    },
                    totalPages: {
                        type: 'number',
                        example: 1,
                    },
                    limit: {
                        type: 'number',
                        example: 10,
                    },
                    page: {
                        type: 'number',
                        example: 1,
                    },
                },
            },
        };
    }
}

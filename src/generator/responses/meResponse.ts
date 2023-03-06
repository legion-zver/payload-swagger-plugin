import {SanitizedCollectionConfig} from 'payload/types';

import {ENTRY_NAME_SUFFIX, LOGIN_RESPONSE_NAME_SUFFIX, ME_RESPONSE_NAME_SUFFIX} from '../constants';
import {SwaggerComponent} from '../types';
import {SwaggerHelper} from '../helpers';

export type MeResponseGenerateOptions = {
    userComponentName?: string;
};

export class MeResponseGenerator {
    static generate(collection: SanitizedCollectionConfig, options?: MeResponseGenerateOptions): SwaggerComponent {
        return {
            name: SwaggerHelper.nameFromSlug(collection.slug, ME_RESPONSE_NAME_SUFFIX),
            scheme: {
                type: 'object',
                properties: {
                    user: {
                        $ref: SwaggerHelper.componentRef(
                            options?.userComponentName ??
                                SwaggerHelper.nameFromSlug(collection.slug, ENTRY_NAME_SUFFIX),
                        ),
                    },
                    collection: {
                        type: 'string',
                    },
                    token: {
                        type: 'string',
                        example: '34o4345324...',
                    },
                    exp: {
                        type: 'number',
                        example: 1609619861,
                    },
                },
            },
        };
    }
}

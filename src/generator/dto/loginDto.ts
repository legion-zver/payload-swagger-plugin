import {SanitizedCollectionConfig} from 'payload/types';

import {LOGIN_DTO_NAME_SUFFIX} from '../constants';
import {SwaggerComponent} from '../types';
import {SwaggerHelper} from '../helpers';

export class LoginDtoGenerator {
    static generate(collection: SanitizedCollectionConfig): SwaggerComponent {
        return {
            name: SwaggerHelper.nameFromSlug(collection.slug, LOGIN_DTO_NAME_SUFFIX),
            scheme: {
                type: 'object',
                properties: {
                    email: {
                        type: 'string',
                        example: 'example@example.com',
                        required: true,
                    },
                    password: {
                        type: 'string',
                        example: '12345678',
                        required: true,
                    },
                },
            },
        };
    }
}

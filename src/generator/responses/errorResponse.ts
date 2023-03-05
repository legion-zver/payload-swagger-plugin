import {SwaggerComponent} from '../types';
import {ERROR_RESPONSE_NAME_SUFFIX} from '../constants';

export class ErrorResponseGenerator {
    static generate(prefix = 'Basic'): SwaggerComponent {
        return {
            name: `${prefix}${ERROR_RESPONSE_NAME_SUFFIX}`,
            scheme: {
                type: 'object',
                properties: {
                    errors: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                message: {
                                    type: 'string',
                                    required: true,
                                },
                            },
                        },
                    },
                },
            },
        };
    }
}

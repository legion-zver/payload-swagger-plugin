import {SwaggerComponent} from '../types';
import {MESSAGE_RESPONSE_NAME_SUFFIX} from '../constants';

export class MessageResponseGenerator {
    static generate(prefix = 'Basic'): SwaggerComponent {
        return {
            name: `${prefix}${MESSAGE_RESPONSE_NAME_SUFFIX}`,
            scheme: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        required: true,
                    },
                },
            },
        };
    }
}

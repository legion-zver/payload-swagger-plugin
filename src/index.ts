import nodePath from 'node:path';
import {Config} from 'payload/config';
import {Payload} from 'payload';
import swaggerUi from 'swagger-ui-express';

import {DEFAULT_LOCALE, DEFAULT_SWAGGER_PATH} from './constants';
import {SwaggerPluginOptions} from './options';
import {SwaggerGenerator} from './generator';

function swagger({collections = [], locale = DEFAULT_LOCALE, path = DEFAULT_SWAGGER_PATH}: SwaggerPluginOptions = {}) {
    return (config: Config): Config => {
        // Wrap onInit
        config.onInit = ((onInit) => {
            return (payload: Payload) => {
                // Check express
                if (!payload.express) {
                    throw new Error('Invalid express instance');
                }
                // Generate Swagger document
                const swaggerDocument = SwaggerGenerator.generate(payload.config, {collections, locale});

                // Use swagger middleware
                payload.express.use(path, swaggerUi.serve, swaggerUi.setup(swaggerDocument));

                // Next onInit
                if (onInit) {
                    return onInit(payload);
                }
            };
        })(config.onInit);

        // Update admin config, set alias for plugin
        config.admin = {
            ...config.admin,
            webpack: (webpackConfig) => {
                const modifiedConfig = {
                    ...webpackConfig,
                    resolve: {
                        ...webpackConfig.resolve,
                        alias: {
                            ...webpackConfig.resolve?.alias,
                            '@itrabbit/payload-swagger-plugin/options': nodePath.resolve(__dirname, './options'),
                            '@itrabbit/payload-swagger-plugin': nodePath.resolve(__dirname, './mock'),
                        },
                    },
                };
                return config.admin?.webpack?.(modifiedConfig) ?? modifiedConfig;
            },
        };

        return config;
    };
}

export default swagger;

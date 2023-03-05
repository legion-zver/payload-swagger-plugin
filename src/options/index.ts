import {CollectionConfig} from 'payload/types';

export interface SwaggerPluginOptions {
    /**
     * Array of collection slugs that the plugin should apply to.
     * If empty use all collection
     *
     * Default: []
     */
    collections?: CollectionConfig['slug'][];

    /**
     * Path for serve documentation
     *
     * Default: /api/swagger
     */
    path?: string;

    /**
     * Locale for documentation
     *
     * Default: en
     */
    locale?: string;
}

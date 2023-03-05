import {upperFirst} from 'lodash';
import {SanitizedCollectionConfig} from 'payload/types';

import {PropertiesGenerator} from '../properties';
import {SwaggerComponent} from '../types';
import {DTO_NAME_SUFFIX} from '../constants';
import {SwaggerHelper} from '../helpers';

export interface EntryDtoGenerateOptions {
    operation?: 'create' | 'update';
    locale?: string;
}

export class EntryDtoGenerator {
    static generate(collection: SanitizedCollectionConfig, options?: EntryDtoGenerateOptions): SwaggerComponent {
        return {
            name: SwaggerHelper.nameFromSlug(
                collection.slug,
                `${upperFirst(options?.operation || 'create')}${DTO_NAME_SUFFIX}`,
            ),
            scheme: {
                type: 'object',
                properties: PropertiesGenerator.generate(collection.fields, {
                    flatRelationships: true,
                    ...(options?.locale
                        ? {
                              locale: options.locale,
                          }
                        : {}),
                }),
            },
        };
    }
}

import {first, values, camelCase, upperFirst} from 'lodash';

export class PayloadHelper {
    static extractStringByLocale(input: any, locale: string): string | undefined {
        if (!input) {
            return undefined;
        }
        if (typeof input === 'string') {
            return input;
        }
        if (typeof input !== 'object') {
            return undefined;
        }
        if (locale in input) {
            return input[locale];
        }
        return first(values(input));
    }
}

export class SwaggerHelper {
    static componentRef(name: string) {
        return `#/components/schemas/${name}`;
    }

    static definitionRef(name: string) {
        return `#/definitions/${name}`;
    }

    static nameFromSlug(slug: string, suffix: string = ''): string {
        return upperFirst(camelCase(`${slug}${suffix}`));
    }

    static operationIdFromSlug(slug: string, op: string): string {
        return camelCase([op, slug].join('_'));
    }
}

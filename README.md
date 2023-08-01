# @itrabbit/payload-swagger-plugin

Payload CMS plugin for generate swagger documentation.

> The plugin is under development!

- [ ] Collection fields
    - [x] text, textarea, email, code, number, date
    - [x] radio, select, checkbox
    - [x] relationship, upload
    - [ ] relationship with many `relationTo` 
    - [x] row, collapsible
    - [x] richText
    - [ ] blocks
    - [x] point
    - [x] group
    - [x] array
    - [x] json 
    - [ ] tabs
    - [ ] ui
- [x] Collection timestamp
- [x] CRUD for collections
- [x] CRUD for version collections
- [ ] Auth Operations
  - [x] login
  - [x] logout
  - [ ] reset password
  - [ ] forgot password
  - [ ] verify email
  - [ ] unlock
  - [ ] refresh token
  - [x] me
- [x] Custom Endpoints (use `collection.endpoints[n].custom.swagger` append path information, use `collection.custom.swagger` for append other info to swagger)
- [ ] Preferences
- [ ] Global

## Getting started

1. Install the package with `npm i @itrabbit/payload-swagger-plugin` or `yarn add @itrabbit/payload-swagger-plugin`.
2. Add the plugin to your `payload.config.ts`:

```ts
import swagger from '@itrabbit/payload-swagger-plugin';

export default buildConfig({
    /* ... */
    plugins: [
        swagger(),
    ],
});
```

Open in browser https://localhost:3000/api/swagger

## Plugin options

Optionally, you can pass the following options to tweak the behavior of the plugin:

```ts
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
```

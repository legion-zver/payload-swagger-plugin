import {Config} from 'payload/config';

function swagger() {
    return (config: Config): Config => {
        return config;
    };
}

export default swagger;

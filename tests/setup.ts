import { TextDecoder, TextEncoder } from 'node:util';

// @ts-ignore
global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;

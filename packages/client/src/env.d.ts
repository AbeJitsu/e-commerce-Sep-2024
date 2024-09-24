/* eslint-disable */

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    VITE_VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined;
    VITE_VUE_ROUTER_BASE: string | undefined;
  }
}

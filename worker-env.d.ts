declare module "cloudflare:workers" {
  export const env: Record<string, any>;
  export interface D1Database {
    prepare(query: string): any;
  }
}

interface Fetcher {
  fetch(request: Request | string): Promise<Response>;
}

interface D1Database {
  prepare(query: string): any;
}

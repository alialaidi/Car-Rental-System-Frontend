export type TokenProvider = () => string | null | undefined | Promise<string | null | undefined>;
export type UnauthorizedHandler = () => boolean | Promise<boolean>;

let tokenProvider: TokenProvider = () => null;
let unauthorizedHandler: UnauthorizedHandler = async () => false;

export function setTokenProvider(provider: TokenProvider): () => void {
  tokenProvider = provider;
  return () => {
    if (tokenProvider === provider) tokenProvider = () => null;
  };
}

export function setUnauthorizedHandler(handler: UnauthorizedHandler): () => void {
  unauthorizedHandler = handler;
  return () => {
    if (unauthorizedHandler === handler) unauthorizedHandler = async () => false;
  };
}

export function getAccessToken(): Promise<string | null> {
  return Promise.resolve(tokenProvider()).then((token) => token?.trim() || null);
}

export function handleUnauthorized(): Promise<boolean> {
  return Promise.resolve(unauthorizedHandler());
}

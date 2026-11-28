// Central API base paths. The UI is a static export served from the same
// origin as the backends; nginx proxies these prefixes (see nginx.conf).
// No REACT_APP_HOST_IP, no localhost:* — relative paths only.
export const E_API = "/e-api/v1";
export const D_API = "/d-api/v1";
export const F_API = "/f-api/v1";

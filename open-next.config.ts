// OpenNext adapter config for Cloudflare Workers (https://opennext.js.org/cloudflare).
import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache';

// Pages are server-rendered at build time and never revalidated, so the read-only
// static-assets cache is enough (no R2 bucket). Switch to the R2 cache if ISR is added.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});

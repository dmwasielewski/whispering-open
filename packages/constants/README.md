# @epicenter/constants

`@epicenter/constants` is a temporary compatibility package retained for
Whispering Open during extraction.

The active app uses it only for Vite/dev-server URL metadata, especially
`APPS.AUDIO.port` and `APP_URLS.AUDIO`.

## Active Imports

```ts
import { APPS } from '@epicenter/constants/apps';
import { APP_URLS } from '@epicenter/constants/vite';
```

Do not add new billing, account, dashboard, or hosted control-plane constants
for Whispering Open.

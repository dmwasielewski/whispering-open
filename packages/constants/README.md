# @epicenter/constants

`@epicenter/constants` is a temporary compatibility package retained for
Whispering Open during extraction.

The active app currently uses it for Vite/dev-server URL metadata, especially
`APPS.AUDIO.port` and `APP_URLS.AUDIO`.

## Active Imports

```ts
import { APPS } from '@epicenter/constants/apps';
import { APP_URLS } from '@epicenter/constants/vite';
```

The package still contains some legacy constants from the old workspace. Treat
those exports as cleanup candidates unless the Whispering Open app imports them
directly.

Do not add new billing, account, dashboard, or hosted control-plane constants
for Whispering Open.

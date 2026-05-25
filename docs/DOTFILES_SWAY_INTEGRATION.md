# dotfiles-sway Integration

Damian's Fedora Sway Atomic automation installs Whispering Open from GitHub releases.

Consumer repo:

```text
/var/home/damian/dotfiles-sway
```

Installer there:

```text
scripts/setup-whispering-open.sh
```

Default source:

```text
dmwasielewski/whispering-open
```

## Expected Release Assets

The installer looks for Linux release assets whose names or URLs match:

```text
linux|x86_64|amd64|appimage|rpm|tar|zip
```

Keep release asset names simple and predictable:

```text
whispering-open-linux-x86_64.AppImage
whispering-open-linux-x86_64.tar.gz
whispering-open-7.11.0-1.x86_64.rpm
```

## Install Location

`dotfiles-sway` installs into:

```text
~/.local/opt/whispering-open
~/.local/bin/whispering-open
~/.local/share/applications/whispering-open.desktop
```

## Failure Behavior

The `dotfiles-sway` setup step is intentionally non-blocking. If no release exists, the network is unavailable, or the asset cannot be unpacked, the overall OS setup continues and logs the failure.

That means this repo can exist before the first release, but users will not get Whispering Open installed until a compatible release asset is published.

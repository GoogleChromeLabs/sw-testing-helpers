#!/bin/bash
set -e

# Get the latest release via the Github API
marionetteReleaseURL=$(curl -s https://api.github.com/repos/mozilla/geckodriver/releases | grep browser_download_url | head -n 1 | cut -d '"' -f 4);

# Get the release file
wget $marionetteReleaseURL -O wires.gz;

# Unpack it
gzip -d wires.gz

# Make it executable
chmod +x wires

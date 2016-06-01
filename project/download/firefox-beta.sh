#!/bin/bash
set -e

# Delete old directory
rm -rf ./firefox-beta

# Unpack into tests directory
wget 'https://download.mozilla.org/?product=firefox-beta-latest&lang=en-US&os=linux64' -O firefox-beta.tar.bz2

# Unpack into tests directory
tar xvjf firefox-beta.tar.bz2

# Rename directory to firefox-beta
mv ./firefox ./firefox-beta

# Delete tar
rm firefox-beta.tar.bz2

#!/bin/bash
set -e

# Delete old directory
rm -rf ./firefox-nightly

# Get nightly
wget 'https://download.mozilla.org/?product=firefox-nightly-latest&lang=en-US&os=linux64' -O firefox-nightly.tar.bz2

# Unpack tar
tar xvjf firefox-nightly.tar.bz2

# Rename directory to firefox-nightly
mv ./firefox ./firefox-nightly

# Delete tar
rm firefox-nightly.tar.bz2

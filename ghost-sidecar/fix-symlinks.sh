#!/bin/bash

cd $(dirname $0)/original

# Fix the ./current symlink
rm current
ln -s versions/6.3.1 current

# Fix the theme symlinks (from content/themes/ directory)
rm content/themes/casper
ln -s ../../current/content/themes/casper content/themes/casper

rm content/themes/source
ln -s ../../current/content/themes/source content/themes/source
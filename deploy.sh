#! /bin/sh

BUILDDIR="build/"
HTMLDIR="~/html"

if [[ -d $BUILDDIR && -d $HTMLDIR ]]; then
    rsync -av --delete $BUILDDIR $HTMLDIR/monatsberichte/
else
    echo "Fehler beim Deployen aufgetreten"
fi

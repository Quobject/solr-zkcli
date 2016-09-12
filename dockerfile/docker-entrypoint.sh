#!/bin/bash
set -e

#echo $1

if [ "$1" = '/opt/solr/bin/solr' ]; then
	chown -R solr .
  sync # got error "error: exec failed: text file busy". use this as suggested at https://github.com/docker/docker/issues/9547
	exec gosu solr "$@"
fi

exec "$@"
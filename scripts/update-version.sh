#!/bin/bash

tools=(yq sponge prettier);
exitText="Please install: yq, moreutils, prettier, ";

for p in "${tools[@]}"; do
	if ! command -v "$p" &> /dev/null
	then
		echo $exitText
		exit 1
	fi
done 

VERSION=$(date +"%-Y.%-m.%-d-t%-H.%-M")

jq ".version=\"$VERSION\"" package.json | sponge package.json
prettier --log-level silent -w package.json

jq ".package.version=\"$VERSION\"" src-tauri/tauri.conf.json | sponge src-tauri/tauri.conf.json
prettier --log-level silent -w src-tauri/tauri.conf.json

sed -i -E "s/^version\s=\s\".+?\"\s?$/version = \"$VERSION\"/g" src-tauri/Cargo.toml

echo "Updated to: $VERSION"

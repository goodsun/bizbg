#!/bin/bash
dir=$(cd $(dirname $0); pwd)
cd ${dir}

rm -r ../dist
mkdir ../dist

if [ $1 = 'stg' ]; then
	cp stg.env ../dist/.env
	filename="stg_upload.zip"
	rm ${dir}/../${filename}
	echo 'Zip for STG'
elif [ $1 = 'prd' ]; then
	cp prd.env ../dist/.env
	filename="prd_upload.zip"
	rm ${dir}/../${filename}
	echo 'Zip for PRD'
elif [ $1 = 'local' ]; then
	cp local.env ../dist/.env
elif [ $1 = 'test' ]; then
	cp local.env ../dist/.env
else
	echo 'input error'
	exit
fi

echo "DIR:" $dir
echo "MODE:" $1

cd ../src
tsc
cp package.json ../dist
cp package-lock.json ../dist
cp -r node_modules ../dist

cd ../dist
if [ $1 = 'local' ]; then
	echo "start express run";
	NODE_ENV=develop node index.js
elif [ $1 = 'test' ]; then
	NODE_ENV=develop node develop.js
else
	zip -r ${dir}/../${filename} ./*
	zip ${dir}/../${filename} .env
	zip --delete ${dir}/../${filename} develop.js
	zip --delete ${dir}/../${filename} test/*
fi

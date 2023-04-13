#!/bin/sh

apt-get update
apt-get install git
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php
./composer.phar require lightsaml/lightsaml


/bin/sh makecrt.sh


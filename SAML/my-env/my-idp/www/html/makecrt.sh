!/bin/sh
CN=my
PASSWORD=abcdefgxyz

SJ="/C=JP/ST=Tokyo/L=Minato-ku/O=hidemiu/OU=hidemiu/CN=$CN"
openssl genrsa -des3 -passout pass:${PASSWORD} -out ${CN}.key 2048
openssl rsa -passin pass:${PASSWORD} -in ${CN}.key -out ${CN}.key
openssl req -new -sha256 -key ${CN}.key -out ${CN}.csr -subj "$SJ"
openssl req -x509 -in ${CN}.csr -key ${CN}.key -out ${CN}.crt -days 3650

# Rippal-Server
Node server for Rippal mobile clients


Import dummy data
----
```bash
mongoimport --host 127.0.0.1 --port 26017 -d rippal-dev -c user --type csv dummy_users.csv --headerline
```
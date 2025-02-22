# open-list
Open-list is a very simple to set up list server with realtime syncronisation and access controll.


# installation
Im going to run the server as user `linux`, feel free to use another user :)

## download

`apt install npm`

`cd /var/www/`

`git clone git@github.com:linuscon/open-list.git`

`mkdir /var/open-list`

`chown -R linux:linux /var/open-list/`

## apache

place the following into your apache wirthost:

```xml
<VirtualHost *:80>
        # The ServerName directive sets the request scheme, hostname and port that
        # the server uses to identify itself. This is used when creating
        # redirection URLs. In the context of virtual hosts, the ServerName
        # specifies what hostname must appear in the request's Host: header to
        # match this virtual host. For the default virtual host (this file) this
        # value is not decisive as it is used as a last resort host regardless.
        # However, you must set it for any further virtual host explicitly.
        #ServerName www.example.com

        ServerAdmin webmaster@localhost
        DocumentRoot /var/www/open-list/app
        #RemoteIPHeader CF-Connecting-IP


        ProxyPass /api/ http://localhost:3000/api/
        ProxyPassReverse /api/ http://localhost:3000/api/


        # Available loglevels: trace8, ..., trace1, debug, info, notice, warn,
        # error, crit, alert, emerg.
        # It is also possible to configure the loglevel for particular
        # modules, e.g.
        #LogLevel info ssl:warn

        <Location "/">
            # place auth stuff here
        </Location>

        ProxyPreserveHost On
        
        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined

        # For most configuration files from conf-available/, which are
        # enabled or disabled at a global level, it is possible to
        # include a line for only one particular virtual host. For example the
        # following line enables the CGI configuration for this host only
        # after it has been globally disabled with "a2disconf".
        #Include conf-available/serve-cgi-bin.conf
</VirtualHost>
```

then enable the site.
Note that you need to have the apache proxy module installed

## systemd
place the following into `/etc/systemd/system/open-list.service

```systemd
[Unit]
Description = Open-List is a simple list server
After = network.target

[Service]
Environment=NODE_PORT=3000
Type=simple
User=linux
Restart=on-failure
WorkingDirectory=/var/www/open-list
ExecStart=npm run api


[Install]
WantedBy = multi-user.target
```

then run `systemctl daemon-reload` and `systemctl enable open-list` and `systemctl start open-list`

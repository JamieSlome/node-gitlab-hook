# node-gitlab-hook

This is an easy to use nodeJS based web hook for GitLab.

## To Install:
```
npm install gitlabhook
```

## To Use:

```javascript
var gitlabhook = require('gitlabhook');
var gitlab = gitlabhook({/* options */} [, callback]);

gitlab.listen();
```

Configure a WebHook URL to whereever the server is listening.

### Available options are:

* **host**: the host to listen on, defaults to `0.0.0.0`
* **port**: the port to listen on, defaults to `3420`
* **configFile**: the json config file. May located at **configPathes**, defaults to `gitlabhook.conf`
* **configPathes**: the search pathes for **configFile**, defaults to `['/etc/gitlabhook/', '/usr/local/etc/gitlabhook/', '.']`
* **keep**: if true, temporary files are not deleted, defaults to `false`. Mostly only for debugging purposes.
* **logger**: an optional instance of a logger that supports the "info" and "error" methods and one parameter for data (like console), default is to not log (`logger:{info:function(s){}, error:function(s){}}`). Mostly only for debugging purposes.
* **tasks**: relations between repositories and shell commands (e.g. `{repo1:'cmd1', repo2:['cmd2a','cmd2b','cmd2c']}`)
* **cmdshell**: the command-line interpreter to be used, defaults to `/bin/sh`

The config file will be ignored if a callback function is declared.

Example config file with task definitions:

```javascript
{
  "tasks": {
    "myRepo": "/usr/local/bin/myDeploy %g",
         "*": ["echo 'GitLab Server %s'",
               "echo 'Repository: %r'",
               "echo 'User: %u'",
               "echo 'Branch: %b'",
               "echo 'Git Url: %g'",
               "echo 'Last Commit: %i'",
               "echo '\tMessage: %m'",
               "echo '\tTime: %t'"]
  }
}
```
The `*` matches any tasks.

The place holders are:

* `%s`: GitLab server's IP address
* `%r`: name of the repository (e.g. `myRepo`)
* `%u`: owner of the repository (user name)
* `%b`: branch reference (e.g. `refs/heads/master`)
* `%g`: ssh-based cloning url on the GitLab server (e.g. `git@gitlab.host:rolf.niepraschk/myRepo.git`)
* `%h`: http-based cloning url on the GitLab server (e.g. `http://gitlab.host/rolf.niepraschk/myRepo.git`)
* `%i`: id of the last commit
* `%t`: timestamp of the last commit
* `%m`: message of the last commit

The file `gitlabhook-server.js` shows an example GitLab Hook server listen at port 3420.

## Installation hints for Linux

The file `gitlabhook.service` is intended to use as a systemd sercvice. The `Makefile` helps to create an rpm archive for a systemd based OS. Call
```
make rpm
```

# License

MIT

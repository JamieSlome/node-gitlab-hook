# node-gitlab-hook

This is a very simple, easy to use web hook for GitLab.

## To Install:
```
npm install node-gitlab-hook
```

## To Use:

```javascript
var gitlabhook = require('gitlabhook');
var gitlab = gitlabhook({/* options */});

gitlab.listen();
```

Configure a WebHook URL to whereever the server is listening.

### Available options are:

* **host**: the host to listen on, defaults to `0.0.0.0`
* **port**: the port to listen on, defaults to `3240`
* **config**: the json config file which overrides the default options. May located at `/etc/gitlabhook/`, `/usr/local/etc/gitlabhook/` or in the current directory, defaults to `gitlabhook.conf`
* **keep**: if true, temporary files are not deleted. Mostly only for debugging purposes.
* **logger**: an optional instance of a logger that supports the "log" and "error" methods and one parameter for data (like console), default is to not log (`logger:{log:function(){}, error:function(){}}`). Mostly only for debugging purposes.
* **tasks**: relations between repositories and shell commands, e.g. `{repo1:'cmd1', repo2:['cmd2a','cmd2b','cmd2c']}`
* **cmdshell**: the command-line interpreter to be used, defaults to `/bin/sh`

Config file with tasks example:

```javascript
{
  "tasks": {
    "myRepo": "/usr/local/bin/myDeploy %g",
         "*": ["echo \"GitLab Server %s\"",
               "echo \"Repository: %r\"",
               "echo \"User: %u\"",
               "echo \"Branch: %b\"",
               "echo \"Git Url: %g\"",
               "echo \"Last Commit: %i\"",
               "echo \"\tMessage: %m\"",
               "echo \"\tTime: %t\""]
  }
}
```
The `*` matches any tasks.

The place holders are:

`%s`: GitLab server's IP address
`%r`: name of the repository (e.g. `myRepo`)
`%u`: owner of the repository (user name)
`%b`: branch reference (e.g. `refs/heads/master`)
`%g`: git cloning path on the GitLab server (e.g. `git@gitlab.host:rolf.niepraschk/myRepo.git`)
`%i`: id of the last commit
`%t`: timestamp of the last commit
`%m`: message of the last commit

# License

MIT

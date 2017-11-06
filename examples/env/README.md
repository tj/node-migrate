# Environment Example

```
$ migrate up --env
$ migrate down --env
$ cat .db # should see table of `contributors`

$ migrate up --env .foo
$ migrate down --env .foo
$ cat .db # should see table of `foo`
```

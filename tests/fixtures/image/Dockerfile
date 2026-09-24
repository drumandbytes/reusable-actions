# Empty base: nothing for Trivy to find, so this only exercises the build,
# layer cache and scan plumbing. Non-root USER keeps the fs scan's Dockerfile
# misconfiguration check (running as root is HIGH) quiet as well.
FROM scratch
COPY hello.txt /hello.txt
USER 65534

FROM node:24-bookworm@sha256:3a09aa6354567619221ef6c45a5051b671f953f0a1924d1f819ffb236e520e6b

ADD https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip awscliv2.zip
RUN unzip awscliv2.zip && ./aws/install
ENV AWS_PAGER=""

COPY ui-tests/package.json /tests/ui-tests/package.json
COPY ui-tests/package-lock.json /tests/ui-tests/package-lock.json
COPY ui-tests/.npmrc /tests/ui-tests/.npmrc
COPY ui-tests/.nvmrc /tests/ui-tests/.nvmrc

RUN cd /tests/ui-tests && npm ci && npm run install-browsers && cd /

# TODO: Remove this once we have an ECS task running with a domain we can point to
# This is for building and running the application locally so tests in the pipeline pass for now.
COPY app/src /src
COPY app/package.json /package.json
COPY app/package-lock.json /package-lock.json
COPY app/.npmrc /.npmrc
COPY app/.nvmrc /.nvmrc
COPY app/tsconfig.json /tsconfig.json

COPY . .

ENTRYPOINT [ "./run-tests.sh" ]

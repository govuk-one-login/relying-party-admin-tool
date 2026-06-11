FROM node:24-bookworm@sha256:3a09aa6354567619221ef6c45a5051b671f953f0a1924d1f819ffb236e520e6b

ADD https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip awscliv2.zip
RUN unzip awscliv2.zip && ./aws/install
ENV AWS_PAGER=""

COPY ui-tests/package.json ui-tests/package.json
COPY ui-tests/package-lock.json ui-tests/package-lock.json
COPY ui-tests/.npmrc ui-tests/.npmrc
COPY ui-tests/.nvmrc ui-tests/.nvmrc

RUN cd ui-tests && npm ci && npm run install-browsers && cd ..

COPY . .

ENTRYPOINT [ "./run-tests.sh" ]

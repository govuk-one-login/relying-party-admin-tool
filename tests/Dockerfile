FROM node:24.14.0-bookworm@sha256:5a593d74b632d1c6f816457477b6819760e13624455d587eef0fa418c8d0777b

ADD https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip awscliv2.zip
RUN unzip awscliv2.zip && ./aws/install
ENV AWS_PAGER=""

COPY ui-tests/package.json /tests/ui-tests/package.json
COPY ui-tests/package-lock.json /tests/ui-tests/package-lock.json
COPY ui-tests/.npmrc /tests/ui-tests/.npmrc
COPY ui-tests/.nvmrc /tests/ui-tests/.nvmrc

RUN cd /tests/ui-tests && npm ci && npm run install-browsers && cd /

COPY . .

ENTRYPOINT [ "./run-tests.sh" ]

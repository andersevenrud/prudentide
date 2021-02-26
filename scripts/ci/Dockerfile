FROM node:14-alpine
WORKDIR /usr/src/prudentide
COPY . .

RUN npm install -g modclean && \
  npm ci --prefer-offline --no-audit --silent --only=prod

RUN modclean -n default:safe,default:caution -P -r && \
  rm -rf package-lock.json

RUN npm uninstall -g modclean

#/!bin/sh

if [ "${NODE_ENV}" == "production" ]; then
  echo "Installing dependencies..."
  npm install --silent --only=prod
  echo "Starting server..."
  exec node bin/api.mjs
else
  echo "Installing dependencies..."
  npm install --silent
  echo "Starting nodemon..."
  exec npx nodemon --ignore node_modules --watch . bin/api.mjs
fi

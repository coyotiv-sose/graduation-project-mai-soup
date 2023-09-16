FROM node:alpine

ENV NODE_ENV=development

WORKDIR /app

# install nodemon as a global package
RUN npm install -g nodemon

# add package.json and package-lock.json to the container
ADD package.json package-lock.json ./
# Install dependencies
RUN npm install

# Add the rest of the files
ADD bin ./bin

# Add execute permissions for entrypoint
RUN chmod +x ./bin/validate-env-vars.sh

# Run the app
ENTRYPOINT ["./bin/validate-env-vars.sh"]
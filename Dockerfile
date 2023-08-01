FROM node:alpine

# Add current directory to the container
ADD . .

# Install dependencies
RUN npm install

# Run the app
CMD ["npm", "start"]

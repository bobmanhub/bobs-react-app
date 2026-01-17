FROM node:24-alpine AS builder
# RUN apk add --no-cache git
# RUN git clone https://github.com/bobmanhub/bobs-react-app.git
COPY . /bobs-react-app
WORKDIR /bobs-react-app
# RUN cd ~/bobs-react-app; npm install
RUN npm i
RUN npm run build:docker
RUN npm install -g serve
EXPOSE 3000 
# listen on port 3000
ENTRYPOINT ["serve", "-d", "dist"]

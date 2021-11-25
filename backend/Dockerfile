FROM node:latest

RUN useradd -ms /bin/bash nodeuser

WORKDIR /home/nodeuser/backend

COPY ["package.json", "package-lock.json", "./"]

RUN npm install -production

RUN chown -R nodeuser /home/nodeuser/backend

USER nodeuser

CMD ["node", "app.js -c config.json"]
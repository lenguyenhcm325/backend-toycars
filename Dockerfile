FROM public.ecr.aws/docker/library/node:18.18.2

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

RUN chmod +x ./startup.sh

CMD ["node", "./src/index.js"]

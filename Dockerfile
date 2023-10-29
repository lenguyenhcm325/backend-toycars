FROM public.ecr.aws/docker/library/node:18.18.2

WORKDIR /app

ENV MONGODB_URI="mongodb+srv://lenguyenhcm325:leminhlaemtoi@dev-toycars-app.x4myv3k.mongodb.net/?retryWrites=true&w=majority" \
    DATABASE_NAME="dev-toycars" \
    COLLECTION_NAME="ProductsByBrand" \
    ALL_PRODUCTS_COLLECTION_NAME="AllProducts" \
    PORT=3000 \
    GOOGLE_CLIENT_ID="777926761995-gkejbcrh3jc00k7gk9phdqrbkqlc0pj9.apps.googleusercontent.com" \
    STRIPE_API_KEY="sk_test_51MoA4lBGR5DYC28pDCRG8b01cH1ZPp6EYDqkcqH1WrktuCmSQ68G1a3kpjrVy23ke96zJeASGqYE1fT4micUpsCk00wwigqNcn" \
    IDENTITY_POOL_ID="eu-central-1:d5dcd59c-429c-4d4e-896b-a055e7b216d4" \
    USER_POOL_ID="eu-central-1_dUzw5Tt7h" \
    AWS_REGION="eu-central-1" \
    USER_POOL_WEB_CLIENT_ID="4rr3ia2fhhb6n0t88g4o4551vg" \
    OAUTH_DOMAIN="https://toycarsuserpool1.auth.eu-central-1.amazoncognito.com" \
    ELASTICSEARCH_NODE_ENDPOINT="http://elasticsearch:9200" \
    ELASTICSEARCH_USERNAME="elastic" \
    ELASTICSEARCH_PASSWORD="mypassword123" \
    ELASTICSEARCH_HOST="elasticsearch" \
    ELASTICSEARCH_PORT=9200 \
    FIREBASE_API_KEY="AIzaSyC0ATpddk7TvsAqR5XNONt7bM5uJhnXAbQ" \
    FIREBASE_AUTH_DOMAIN="toycars-1269f.firebaseapp.com" \
    FIREBASE_PROJECT_ID="toycars-1269f" \
    FIREBASE_STORAGE_BUCKET="toycars-1269f.appspot.com" \
    FIREBASE_MESSAGING_SENDER_ID=476861539027 \
    FIREBASE_APP_ID="1:476861539027:web:933874f793ec3d1c132a26" \
    FIREBASE_MEASUREMENT_ID="G-DC5H2R2YDX" \
    IAM_ACCESS_KEY_ID="AKIAURNPQOHOCNZPOHX2" \
    IAM_SECRET_ACCESS_KEY="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" \
    SES_FROM_EMAIL="lenguyenhcm325@gmail.com" \
    SES_FROM_EMAIL_ARN="arn:aws:ses:eu-central-1:312290079196:identity/lenguyenhcm325@gmail.com" \
    SES_REPLY_TO_EMAIL="lenguyenhcm0711@gmail.com" \ 
    FRONTEND_ENDPOINT="http://18.194.12.173"

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

RUN chmod +x ./startup.sh

CMD ["node", "./src/index.js"]

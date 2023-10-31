# Project's Backend Repository

## Highlights

### Deployed along with the frontend on EC2 Instance using Docker Swarm

- This provides automatic service restarts in case of errors. With Elastic IP enabled, it offers a consistent endpoint for the users to access the website.
- [docker-compose.yml file](./docker-compose.yml)

### Automated AWS CodePipeline builds image and push to AWS ECR once the code is committed to the repository.

- A fully functioned pipeline ensures that the latest version of the application is built and pushed directly to a container registry for deployment readiness.
- [buildspec.yml for CodeBuild](./buildspec.yml)

![CodePipeline](./readme_images/codepipeline1.png)

### ElasticSearch Integration - [elasticsearch.js code](./src/services/elasticsearch.js)

- ElasticSearch query for the JavaScript CDK is populated programmatically based on user input. Full text fuzzy search functionality and price sorting for products is implemented via ElasticSearch in the [`/api/search` route](). (Currently using _free-trial plan_ just for demonstration purpose)

### Nginx serves as a reverse proxy

- Both the frontend and backend are containerized using Docker, with Nginx acting as a reverse proxy. Nginx addresses CORS issues, and also help with service discovery between the services.
- [nginx.conf file](./src/nginx.conf)

```yml
nginx:
  image: nginx:latest
  ports:
    - "80:80"
  volumes:
    - ./nginx.conf:/etc/nginx/conf.d/default.conf
  networks:
    - appnetwork
  deploy:
    replicas: 1
    restart_policy:
      condition: on-failure
  healthcheck:
    disable: true
  depends_on:
    - frontend
    - backend
```

### Logging with Winston and push to CloudWatch Logs - [Winston customized logging code](./src/services/winston.js)

- Using the custom `Logger` function with various logging levels, Winston handles logging reliably to the terminal and CloudWatch Logs, facilitating better debugging in case of errors.

```javascript
// Import statement in other files:
const Logger = require("./services/winston");
const logger = Logger(__filename);
```

### Stripe API Test Integration - [/payment/create-checkout-session route code]()

- Clicking "Checkout" on the frontend sends cart items to the backend, prompting Stripe to initiate a checkout session with a genuine-looking UI for payment details. Users can simulate payment using a mock credit card.

![Stripe Checkout Test Mode UI](./readme_images/stripe_checkout_ui1.png)

### Send email after successful payment with AWS Simple Email Service - [ses.js code](./src/services/ses.js)

- After Stripe's redirection to the frontend, an order confirmation email detailing product information, quantity, and shipping cost is sent to the user. Along with this, the related Stripe PaymentIntent object's gets the `alreadySentMail` metadata's attribute updated to `true`

![Order Confirmation SES Email](./readme_images/order_confirmation_email1.png)

### Easy Diffusion to generate product images

- Product images on the site are generated through Easy Diffusion, a local application that leverages Stable Diffusion for high-quality images.

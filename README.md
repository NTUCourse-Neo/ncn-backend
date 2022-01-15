# ncn-backend
Backend API service for NTUCourse-Neo.
## 🛠 Deployment

### 🐋 Docker (Recommended)
1. Clone the repository
    ```bash
    git clone https://github.com/NTUCourse-Neo/ncn-backend.git
    cd ncn-backend
    ```
1. Prepare your `.env` file
    
    Run command below to create a `.env` file
    ```bash
    cp .env.defaults .env
    ```
    Then paste your keys into the file. Please refer to the guide below.    
    | KEY                  | Description                                    | Default Value |
    | -------------------- | ---------------------------------------------- | ------------- |
    | MONGO_URL            | MongoDB connection string                      | N/A           |
    | PORT                 | Server running port                            | 5000          |
    | OTP_EXPIRE_MINUTES   | Linking One Time Password (OTP) expire minutes | 5             |
    | ENV                  | Running environment                            | dev           |
    | AUTH0_DOMAIN         | Auth0 Account Domain                           | N/A           |
    | AUTH0_CLIENT_ID      | Auth0 API Service Client ID                    | N/A           |
    | AUTH0_CLIENT_SECRET  | Auth0 API Service Client Secret                | N/A           |
    | AUTH0_API_AUDIENCE   | Auth0 Management API Identifier                | N/A           |
    | SELF_API_AUDIENCE    | NTUCourse-Neo API Identifier                   | N/A           |
    | SENDGRID_FROM_EMAIL  | Sendgrid Sender E-Mail Address                 | N/A           |
    | SENDGRID_API_KEY     | Sendgrid API Key                               | N/A           |
    | SENDGRID_OTP_TMPL_ID | Sendgrid E-Mail Template ID for OTP            | N/A           |
    | RECAPTCHA_SECRET     | reCAPTCHA Service Client Secret                | N/A           |
    | DISCORD_WEBHOOK_URL  | Discord Webhook URL                            | N/A           |


1. Install Docker on your device.
   
   Please refer to this [guide](https://docs.docker.com/engine/install/).

2. Build docker image
    ```bash
    docker build -f Dockerfile -t ncn-backend .
    ```

3. Run the built image in container
    ```bash
    docker run -d --env-file .env -p 5000:5000 ncn-backend
    ```

4. Open the browser and go to `http://localhost:5000/api/v1/healthcheck`
   
   and you should see the 200 OK response.
5. Have fun! 🎉
### 💻 Run in local
1. Clone the repository
    ```bash
    git clone https://github.com/NTUCourse-Neo/ncn-backend.git
    cd ncn-backend
    ```
2. Prepare your `.env` file
    
    Run command below to create a `.env` file
    ```bash
    cp .env.defaults .env
    ```
    Then paste your keys into the file. Please refer to the guide below.    
    | KEY                  | Description                                    | Default Value |
    | -------------------- | ---------------------------------------------- | ------------- |
    | MONGO_URL            | MongoDB connection string                      | N/A           |
    | PORT                 | Server running port                            | 5000          |
    | OTP_EXPIRE_MINUTES   | Linking One Time Password (OTP) expire minutes | 5             |
    | ENV                  | Running environment                            | dev           |
    | AUTH0_DOMAIN         | Auth0 Account Domain                           | N/A           |
    | AUTH0_CLIENT_ID      | Auth0 API Service Client ID                    | N/A           |
    | AUTH0_CLIENT_SECRET  | Auth0 API Service Client Secret                | N/A           |
    | AUTH0_API_AUDIENCE   | Auth0 Management API Identifier                | N/A           |
    | SELF_API_AUDIENCE    | NTUCourse-Neo API Identifier                   | N/A           |
    | SENDGRID_FROM_EMAIL  | Sendgrid Sender E-Mail Address                 | N/A           |
    | SENDGRID_API_KEY     | Sendgrid API Key                               | N/A           |
    | SENDGRID_OTP_TMPL_ID | Sendgrid E-Mail Template ID for OTP            | N/A           |
    | RECAPTCHA_SECRET     | reCAPTCHA Service Client Secret                | N/A           |
    | DISCORD_WEBHOOK_URL  | Discord Webhook URL                            | N/A           |
  
3. Install required dependencies
    ```bash
    yarn
    ```

4. Run the server
    ```bash
    yarn server
    ```
5. Open the browser and go to `http://localhost:5000/api/v1/healthcheck`
   
   and you should see the 200 OK response.
6. Have fun! 🎉



## 📦 Packages
 - babel
 - nodemon
 - express
 - axios
 - cors
 - dotenv-defaults
 - express-jwt
 - express-oauth2-jwt-bearer
 - jwks-rsa
 - mongoose
 - mongodb
 - @sendgrid/mail
# Run Backend
1. From root directory cd into backend
2. Run command npm run start

# Run Frontend
1. From root directory cd into backend
2. Run command npm run dev

# Login to AWS console from terminal
1. From root directory run command aws sso login
2. To work with aws cdk, cd into cdk and use command you want e.g cdk diff

# Notice
1. Github pipeline was not used. Deployment to aws is done manually for learning purposes

# Frontend Directories
1. Frontend folders and files:
  - src
    - assets
    - components
    - context
    - lang
    - test-utils
    - views
    - App.tsx
    - main.tsx
2. Assets folder: Assets folder holds the images used in the app

3. Components Folder: The components folder contains reusable UI elements that are used throughout the application. These components are designed to be modular and can be easily integrated into different parts of the application. Below are some of the key components:
  - CameraAccessComponent: This component handles camera access functionality, allowing users to take pictures or stream video from their device's camera.
  - FileUploadComponent: This component provides a user interface for uploading files. It includes features such as file selection, drag-and-drop support, and file validation.
  - Header: This component renders the header section of the application, including the logo.
  - InfoComponent: This component displays informational messages to the user.
  - LogoComponent: This component renders the application's logo.
  - Layers: This component manages and renders different layers on the map.
  - MapComponent: This component is responsible for rendering the map interface.
  - RadioInputComponent: This component renders a customizable radio input for user selections.
  - SubmitButtonComponent: This component renders a customizable submit button for form submissions.

4. Context Folder: The context folder holds the application's context files, which are used to manage and share state across different components. Below is the key context file:

  - AppContext.tsx: This file defines the default props and context for the application. It provides a way to pass data through the component tree without having to pass props down manually at every level. The context is used around the app to manage global state, such as user authentication status, theme settings, and other shared data.
  
  The context folder helps in maintaining a clean and organized state management system, making it easier to manage and update the application's state.

  NB: Redux is not used because the application state management requirements are relatively simple and can be effectively handled using React's Context API. Using Context API reduces the boilerplate code and complexity that comes with Redux, making the codebase easier to maintain and understand.

5. Lang folder: Lang folder holds texts for app. If text is to be updated it can be in lang.ts

6. Utils folder: utils folder holds files that include helper functions

7. Views folder: The views folder contains the main view components of the frontend application. Each view component is responsible for rendering a specific part of the user interface. Below are some of the key view components:
  - MapView: The MapView component is responsible for rendering the map interface. It includes various layers and markers to display geographical information.
  - Main: The Main component is the primary view of the application. It manages UI sections using css Grid UI such as map, radio inputs, submit buttons, and logos. It also handles user interactions and state management for the main functionalities.
  - FilesPage: The FilesPage component is responsible for handling file uploads and camera access. It includes components for uploading files and accessing the camera to take pictures.

# Backend Directories
1. The backend directories contain the server-side code and configurations necessary to support the frontend application. These directories include various modules and services that handle data processing, communicates with aws services, and other backend functionalities. Backend folders and files:
  - backend
    - dist
    - node_modules
    - src
      - health
      - app.controller.spec.ts
      - app.controller.ts
      - app.dto.ts
      - app.interface.ts
      - app.mailer.service.ts
      - app.module.ts
      - app.service.ts
      - main.ts
    - .env
    - Dockerfile

2. app.controller.ts: The AppController is a NestJS controller that handles HTTP requests for the application. It includes the following endpoints:
  - **GET /**: Fetches a list of answers.
  - **GET /presigned-url/:fileName**: Generates a pre-signed URL for file uploads to AWS S3.
  - **POST /**: Creates a new answer.

3. app.dto.ts: The `AppDto` class is a Data Transfer Object (DTO) used to validate and transfer data for the application. It includes the following properties:

  - **id**: A UUID string that uniquely identifies the answer.
  - **answer**: A non-empty string representing the answer.
  - **evaluateAnswer**: A non-empty string representing the evaluated answer.
  - **file**: A non-empty string representing the file associated with the answer.
  - **geoLocation**: An array of two numbers representing the geographical location (latitude and longitude).
  - **geoLocationAccuracy**: A number representing the accuracy of the geographical location, or null if not available.
  - **userGeoLocation**: An optional array of two numbers representing the user's geographical location (latitude and longitude), or null if user does not edit his/her location.
  The class uses decorators from the `class-validator` library to enforce validation rules on the properties.

4. app.interface.ts: The `isAnswer` function is a type guard that checks if an object conforms to the `Answer` interface. It returns `true` if the object matches the `Answer` structure, and `false` otherwise.

5. app.mailer.service.ts: The `MailerService` is an injectable service in NestJS that handles sending emails using the `nodemailer` library. It is configured to use Gmail as the email service provider.

6. app.service.ts: The `AppService` is an injectable service in NestJS that handles various backend operations, including interactions with AWS services such as DynamoDB and S3, as well as sending emails.

7. main.ts: The entry point of the NestJS application. It sets up the application, enables CORS, and includes a logging middleware.

# AWS CDK
The AWS CDK (Cloud Development Kit) is responsible for defining and provisioning cloud infrastructure using code.
The important folders are the lib and the bin

1. lib:
  - answers-stack.ts: Defines an AWS CDK stack that creates an S3 bucket for storing answers. The bucket is versioned and has a removal policy set to destroy. The stack also outputs the bucket name.

  - photo-bucket.ts: Defines an AWS CDK stack that creates an S3 bucket for uploading photos. It configures CORS settings, sets up a Cognito Identity Pool for unauthenticated access, and grants necessary permissions to an IAM role. The stack also outputs the bucket name and identity pool ID.

  - frontend-stack.ts: Defines an AWS CDK stack that sets up the infrastructure for hosting a frontend application. It includes an S3 bucket for storing the website files, a CloudFront distribution for content delivery, an ACM certificate for HTTPS, and Route 53 for DNS management. It also deploys the frontend application to the S3 bucket.

  - backend-stack.ts: Defines an AWS CDK stack that sets up the backend infrastructure. It includes a VPC, a DynamoDB table, an ECS Fargate service with a Docker image, an Application Load Balancer, and Route 53 for DNS management. The stack also configures IAM roles and policies for accessing AWS resources.

  For frontend stack deployment, cd into frontend directory, run command `npm run buld` and after compiling then cd into 
  cdk directory to deploy
  All cdk stack are deployed cd into the bin directory and from terminal 
   - cdk deploy BackendStack
   - cdk deploy FrontendStack
   - cdk deploy PhotoBucketStack
   - cdk deploy AnswersStack

  As mentioned earlier, deployment is done manually. It is possible to add CI/CD
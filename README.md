### serverless

This repository contains the infrastructure setup for managing Cloud Functions within the context of serverless architecture. The Cloud Functions implemented here are responsible for handling user account creation events and initiating email verification for the newly created accounts.

## Implementation Details

## Cloud Function Responsibilities

The Cloud Function implemented here is invoked by the Pub/Sub service whenever a new user account is created. Its primary responsibilities include:

## Email Verification Link Generation:

Upon receiving an account creation event, the function generates a verification link that is emailed to the user.
The verification link expires after 2 minutes to ensure timely verification. Expired links are invalidated and cannot be used for verification.

## Email Tracking in CloudSQL:

The function tracks the emails sent within a CloudSQL instance.
Utilize the existing CloudSQL instance and database used by the web application for seamless integration and data management.



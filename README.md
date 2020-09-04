## My Cactus Simulation Alexa Game

This is the repository for the my cactus simulation Alexa Game. This is an Alexa skill where players manage the light and watering of a cactus. They must check in frequently and keep the cactus alive and happy!

This skill uses the Alexa Web API for Games for 3D graphics on capable devices. The game is fully playable everywhere Alexa is, since it is a voice-driven experience. 

## Alexa Skill Usage Instructions

This project is meant to be used with ASK CLI V2. There is AWS infrastructure involved and you will also need an AWS account for this. This uses the ASK CLI V2 cfn-deployer. The infrastructure is defined in [skill-stack.yaml](./infrastructure/cfn-deployer/skill-stack.yaml). The code is defined in the lambda directory. 


### Get this repo
If you want to run this sample, make sure you are running ASK CLI v2. For instructions on doing so and setting up an AWS IAM user for use with the CLI, see [the technical reference docs.](https://developer.amazon.com/en-US/docs/alexa/smapi/quick-start-alexa-skills-kit-command-line-interface.html)

From your terminal, try:

`ask new --template-url https://github.com/alexa/skill-sample-nodejs-web-api-my-cactus`

Select `AWS with CloudFormation`.

Use the defaults for each of the answers. This will set you up with the skill. From there: 

To build this sample, first build the node packages:

1. `cd lambda`
2. `npm install`
3. `cd ..`

Now, your AWS entity associated with the CLI will need access to create and manage the following resources: Cloudformation, IAM, AWS Lambda, Cloudfront, S3. Go to the AWS console, and for your IAM user, add these permissions.

For instance, adding the following policies will grant all the deploy access you will need:
* AWSLambdaFullAccess
* IAMFullAccess
* AmazonS3FullAccess
* CloudFrontFullAccess
* AWSCloudFormationFullAccess

Then you can deploy using: `ask deploy` from this directory. This will set up the stack, but will not upload the web assets needed. For that, you will need to get the name of the PublicRead S3 bucket created in the cloudformation deployment and set that as an environment variable. For instance: 

`export MY_CACTUS_S3="ask-pricklypete-default-skillstack-s3webappbucket-1234abc56789.s3.amazonaws.com"`

Then, head over to the webapp directory. From there, run:

`uploadS3`

This will take the files and upload them. From there, you can directly test and the code will point to the public website hosted in the cloud. If you would like to override the value provided for the publicly accessible link to a local one (for instance, if you are serving the assets from your local environment), simply open up the Lambda console, and override the "Domain" environment variable with your own. For more instructions head to the [webapp directory](./webapp).

### Clone the Git repo

If you want to make changes to this repo and set up the skill using the previous methods, 

TODO Write these.

## Web Application Setup

You can find the code and information about the Node.js web application under the [webapp directory](./webapp). 

## Bugs?

Please open bug reports on GitHub using GitHub issues. Include the steps taken to reproduce. You can use this for suggested improvements as well. 

Feel free to fork and open a pull request if you have a fix or improvement to make, also!

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the Amazon Software License.

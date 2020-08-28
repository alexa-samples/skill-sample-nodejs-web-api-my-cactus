## Alexa Skill Usage Instructions

This project is meant to be used with ASK CLI V2. There is infrastructure involved and you will also need an AWS account. This uses the cfn-deployer. The infrastructure is defined in [skill-stack.yaml](./infrastructure/cfn-deployer/skill-stack.yaml). The code is defined in the lambda directory. 

To set up this sample, first build the node packages:

1. `cd lambda`
2. `npm install`
3. `cd ..`

Now, your AWS entity associated with the CLI will need access to create and manage the following resources: Cloudformation, IAM, AWS Lambda, Cloudfront, S3

For instance, the following policies will grant deploy access:
* AWSLambdaFullAccess
* IAMFullAccess
* AmazonS3FullAccess
* CloudFrontFullAccess
* AWSCloudFormationFullAccess

Then you can deploy using: `ask deploy` from this directory. This will set up the stack, but will not upload the assets needed. For that, you will need to get the name of the PublicRead S3 bucket created in the cloudformation deployment and set that as an environment variable. For instance: 

`export MY_CACTUS_S3="ask-pricklypete-default-skillstack-s3webappbucket-31a9w7rv6uls.s3.amazonaws.com"`

Then, head over to the webapp directory. From there, run:

`uploadS3`

This will take the files and upload them. From there, you can directly test and the code will point to the public website hosted in the cloud. If you would like to override the value provided for the publicly accessible link to a local one (for instance, if you are serving the assets from your local environment), simply open up the Lambda console, and override the "Domain" environment variable with your own. 

## Bugs?

Please open bug reports on Github using Github issues. Include the steps taken to reproduce. You can use this for suggested improvements, as well.

Feel free to fork and open a pull request if you have a fix or improvement to make, also!
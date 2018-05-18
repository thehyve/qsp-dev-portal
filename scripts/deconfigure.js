#!/usr/bin/env node
/*
* Convenience script to scrub templates.
* Especially useful during development of reference implementation.
*/
'use strict'

const fs = require('fs')
const path = require('path')

const rootDir = path.resolve(__dirname, '..')
const packageJson = require(`${rootDir}/package.json`)
const config = packageJson.config

module.exports = function() {
  modifyDevPortalAwsService(config.cognitoIdentityPoolId, config.primaryAwsRegion, config.cognitoRegion, config.cognitoUserPoolId, config.cognitoClientId, config.apiGatewayApiId)
  modifyPackageFile(config)
  modifyUiPackageFile(config.siteS3Bucket, config.primaryAwsRegion)
}

function modifyDevPortalAwsService(cognitoIdentityPoolId, primaryAwsRegion, cognitoRegion, cognitoUserPoolId, cognitoClientId, apiGatewayApiId) {
    const htmlPath = `${rootDir}/dev-portal/src/services/aws.js`;
    const html = fs.readFileSync(htmlPath, 'utf8')
    const cognitoIdentityPoolIdRegex = new RegExp(`export const cognitoIdentityPoolId = '${cognitoIdentityPoolId}'`, 'g')
    const cognitoRegionRegex = new RegExp(`export const cognitoRegion = '${cognitoRegion}'`, 'g')
    const primaryAwsRegionRegex = new RegExp(`export const awsRegion = '${primaryAwsRegion}'`, 'g')
    const cognitoUserPoolIdRegex = new RegExp(`export const cognitoUserPoolId = '${cognitoUserPoolId}'`, 'g')
    const apigInvokeUrlRegex = new RegExp(`export const apigInvokeUrl = 'https://${apiGatewayApiId}.execute-api.${primaryAwsRegion}.amazonaws.com/prod';`, 'g')
    const cognitoClientIdRegex = new RegExp(`export const cognitoClientId = '${cognitoClientId}'`, 'g')
    const htmlModified = html
      .replace(cognitoIdentityPoolIdRegex, 'export const cognitoIdentityPoolId = \'YOUR_COGNITO_IDENTITY_POOL_ID\'')
      .replace(cognitoUserPoolIdRegex, 'export const cognitoUserPoolId = \'YOUR_COGNITO_USER_POOL_ID\'')
      .replace(cognitoClientIdRegex, 'export const cognitoClientId = \'YOUR_COGNITO_CLIENT_ID\'')
      .replace(primaryAwsRegionRegex, `export const awsRegion = 'YOUR_PRIMARY_AWS_REGION'`)
      .replace(cognitoRegionRegex, `export const cognitoRegion = 'YOUR_COGNITO_REGION'`)
      .replace(apigInvokeUrlRegex, 'export const apigInvokeUrl = \'https://YOUR_API_GATEWAY_API_ID.execute-api.YOUR_PRIMARY_AWS_REGION.amazonaws.com/prod\';');

    fs.writeFileSync(htmlPath, htmlModified, 'utf8')
}

function modifyPackageFile(config) {
    const packageJsonPath = `${rootDir}/package.json`
    const packageJson = fs.readFileSync(packageJsonPath, 'utf8')
    const artifactsS3BucketRegex = new RegExp(`"artifactsS3Bucket": "${config.artifactsS3Bucket}"`, 'g')
    const siteS3BucketRegex = new RegExp(`"siteS3Bucket": "${config.siteS3Bucket}"`, 'g')
    const apiGatewayApiNameRegex = new RegExp(`"apiGatewayApiName": "${config.apiGatewayApiName}"`, 'g')
    const accountIdRegex = new RegExp(`"accountId": "${config.accountId}"`, 'g')
    const cloudFormationStackNameRegex = new RegExp(`"cloudFormationStackName": "${config.cloudFormationStackName}"`, 'g')
    const primaryAwsRegionRegex = new RegExp(`"primaryAwsRegion": "${config.primaryAwsRegion}"`, 'g')
    const apiGatewayApiIdRegex = new RegExp(`"apiGatewayApiId": "${config.apiGatewayApiId}"`, 'g')
    const cognitoRegionRegex = new RegExp(`"cognitoRegion": "${config.cognitoRegion}"`, 'g')
    const cognitoUserPoolIdRegex = new RegExp(`"cognitoUserPoolId": "${config.cognitoUserPoolId}"`, 'g')
    const cognitoClientIdRegex = new RegExp(`"cognitoClientId": "${config.cognitoClientId}"`, 'g')
    const cognitoIdentityPoolIdRegex = new RegExp(`"cognitoIdentityPoolId": "${config.cognitoIdentityPoolId}"`, 'g')
    const packageJsonModified = packageJson
      .replace(artifactsS3BucketRegex, '"artifactsS3Bucket": "YOUR_ARTIFACTS_BUCKET_NAME"')
      .replace(siteS3BucketRegex, '"siteS3Bucket": "YOUR_CLIENT_BUCKET_NAME"')
      .replace(apiGatewayApiNameRegex, '"apiGatewayApiName": "YOUR_API_GATEWAY_API_NAME"')
      .replace(accountIdRegex, '"accountId": "YOUR_ACCOUNT_ID"')
      .replace(cloudFormationStackNameRegex, '"cloudFormationStackName": "YOUR_CLOUDFORMATION_STACK_NAME"')
      .replace(apiGatewayApiIdRegex, '"apiGatewayApiId": "YOUR_API_GATEWAY_API_ID"')
      .replace(cognitoUserPoolIdRegex, '"cognitoUserPoolId": "YOUR_COGNITO_USER_POOL_ID"')
      .replace(cognitoClientIdRegex, '"cognitoClientId": "YOUR_COGNITO_CLIENT_ID"')
      .replace(cognitoIdentityPoolIdRegex, '"cognitoIdentityPoolId": "YOUR_COGNITO_IDENTITY_POOL_ID"')
      .replace(primaryAwsRegionRegex, '"primaryAwsRegion": "YOUR_PRIMARY_AWS_REGION"')
      .replace(cognitoRegionRegex, '"cognitoRegion": "YOUR_COGNITO_REGION"')

    fs.writeFileSync(packageJsonPath, packageJsonModified, 'utf8')
}

function modifyUiPackageFile(siteS3Bucket, primaryAwsRegion) {
    const packageJsonPath = `${rootDir}/dev-portal/package.json`
    const packageJson = fs.readFileSync(packageJsonPath, 'utf8')
    const homePageRegex = new RegExp(`"homepage": "http://${siteS3Bucket}.s3-website.${primaryAwsRegion}.amazonaws.com/"`, 'g')

    const packageJsonModified = packageJson
      .replace(homePageRegex, '"homepage": "http://YOUR_CLIENT_BUCKET_NAME.s3-website.YOUR_PRIMARY_AWS_REGION.amazonaws.com/"')

    fs.writeFileSync(packageJsonPath, packageJsonModified, 'utf8')
}

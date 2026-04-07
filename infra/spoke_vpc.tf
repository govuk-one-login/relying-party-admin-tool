resource "aws_cloudformation_stack" "spoke_vpc_stack" {
  # See https://govukverify.atlassian.net/wiki/x/YoGDVgE
  name         = "spoke-vpc"
  template_url = "https://template-storage-templatebucket-1upzyw6v9cs42.s3.eu-west-2.amazonaws.com/spoke-vpc/template.yaml"

  parameters = merge({
    IpamPool         = var.transit_gateway_ipam_pool
    TransitGatewayId = var.transit_gateway_id


    # Egress Testing
    TestEgress = "No"

    # Allowed AWS Service VPC Endpoints
    VpcLinkEnabled           = "Yes"
    ECRApiEnabled            = "Yes"
    CloudWatchLogsApiEnabled = "Yes"

    # Disabled services
    DynamoDBApiEnabled            = "No"
    S3ApiEnabled                  = "No"
    SecretsManagerApiEnabled      = "No"
    KMSApiEnabled                 = "No"
    SQSApiEnabled                 = "No"
    LambdaApiEnabled              = "No"
    CloudWatchApiEnabled          = "No"
    STSApiEnabled                 = "No"
    SSMApiEnabled                 = "No"
    CodeBuildApiEnabled           = "No"
    CodeDeployApiEnabled          = "No"
    BatchApiEnabled               = "No"
    GlueApiEnabled                = "No"
    XRayApiEnabled                = "No"
    AthenaApiEnabled              = "No"
    SNSApiEnabled                 = "No"
    KinesisApiEnabled             = "No"
    FirehoseApiEnabled            = "No"
    EventsApiEnabled              = "No"
    StatesApiEnabled              = "No"
    ExecuteApiGatewayEnabled      = "No"
    TextractApiEnabled            = "No"
    CloudFormationEndpointEnabled = "No"
    SESSmtpEnabled                = "No"
    SSMParametersStoreEnabled     = "No"
    DynatraceApiEnabled           = "No"
    RestAPIGWVpcLinkEnabled       = "No"
    AppConfigApiEnabled           = "No"
    AppConfigDataApiEnabled       = "No"
    CloudTrailApiEnabled          = "No"
    IdentityStoreApiEnabled       = "No"
    }, var.environment == "production" ? {
    # Disaster Recovery
    // Only set this value in production environments.
    DisasterRecoveryTransitGatewayId = var.transit_gateway_dr_id
    UseDisasterRecovery              = var.use_dr_transit_gateway ? "Yes" : "No"
  } : {})

  capabilities = ["CAPABILITY_NAMED_IAM", "CAPABILITY_AUTO_EXPAND"]

  depends_on = [aws_cloudformation_stack.transit_gateway_cross_account_role]
}

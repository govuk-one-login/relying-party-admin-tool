# See https://govukverify.atlassian.net/wiki/spaces/PLAT/pages/3059908609/How+to+deploy+a+SAM+application+with+secure+pipelines
resource "aws_cloudformation_stack" "main_pipeline_stack" {
  name         = "${var.environment}-rpat-pipeline"
  template_url = "https://template-storage-templatebucket-1upzyw6v9cs42.s3.amazonaws.com/sam-deploy-pipeline/template.yaml"

  parameters = {
    SAMStackName                    = "${var.environment}-rpat-deploy"
    Environment                     = var.environment
    VpcStackName                    = "spoke-vpc"
    SigningProfileArn               = "none"
    SigningProfileVersionArn        = "none"
    ContainerSignerKmsKeyArn        = var.container_signer_kms_key_arn
    GitHubRepositoryName            = var.create_build_stacks ? var.repository_name : "none"
    BuildNotificationStackName      = "build-notifications"
    SlackNotificationType           = var.environment == "dev" ? "None" : "Failures"
    ProgrammaticPermissionsBoundary = "True"
    TestImageRepositoryNames        = contains(["build"], var.environment) ? var.repository_name : ""
    TestImageRepositoryUri          = contains(["build"], var.environment) ? aws_cloudformation_stack.test_image_ecr_stack.outputs["TestRunnerImageEcrRepositoryUri"] : "none"
    RunTestContainerInVPC           = contains(["build"], var.environment) ? "True" : "False"
    IncludePromotion                = contains(["build", "staging"], var.environment) ? "Yes" : "No"
    AllowedAccounts                 = join(",", var.allowed_promotion_accounts)
    AllowedServiceOne               = "DynamoDB"
    AllowedServiceTwo               = "ECR & ECS"
  }

  capabilities = ["CAPABILITY_NAMED_IAM", "CAPABILITY_AUTO_EXPAND"]
  depends_on   = [aws_cloudformation_stack.spoke_vpc_stack, aws_cloudformation_stack.build_notifications_stack]
}

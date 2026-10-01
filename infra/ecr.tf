# See https://govukverify.atlassian.net/wiki/spaces/PLAT/pages/3107258369/How+to+deploy+a+container+to+Fargate+with+secure+pipelines#Step-3:-Create-a-repository-in-ECR
resource "aws_cloudformation_stack" "ecr_stack" {
  name         = "${var.environment}-rpat-ecr"
  template_url = "https://template-storage-templatebucket-1upzyw6v9cs42.s3.amazonaws.com/container-image-repository/template-${var.ecr_stack_version}.yaml"
  parameters = {
    PipelineStackName  = "${var.environment}-rpat-pipeline"
    RetainedImageCount = 10
  }

  capabilities = ["CAPABILITY_NAMED_IAM", "CAPABILITY_AUTO_EXPAND"]
}

resource "aws_cloudformation_stack" "test_image_ecr_stack" {
  name         = "${var.environment}-rpat-test-image-ecr"
  template_url = "https://template-storage-templatebucket-1upzyw6v9cs42.s3.amazonaws.com/test-image-repository/template-${var.test_image_repository_stack_version}.yaml"
  parameters = {
    PipelineStackName  = "${var.environment}-rpat-pipeline"
    RetainedImageCount = 10
  }

  capabilities = ["CAPABILITY_NAMED_IAM", "CAPABILITY_AUTO_EXPAND"]
}

# See https://govukverify.atlassian.net/wiki/spaces/PLAT/pages/3107258369/How+to+deploy+a+container+to+Fargate+with+secure+pipelines#Step-3:-Create-a-repository-in-ECR
resource "aws_cloudformation_stack" "ecr_stack" {
  name         = "${var.environment}-rpat-ecr"
  template_url = "https://template-storage-templatebucket-1upzyw6v9cs42.s3.amazonaws.com/container-image-repository/template.yaml"
  parameters = {
    PipelineStackName  = "${var.environment}-rpat-pipeline"
    RetainedImageCount = 10
  }

  capabilities = ["CAPABILITY_NAMED_IAM", "CAPABILITY_AUTO_EXPAND"]
}

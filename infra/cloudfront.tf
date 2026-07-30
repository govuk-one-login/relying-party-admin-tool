resource "aws_cloudformation_stack" "cloudfront_distribution" {
  name = "cloudfront-distribution"
  parameters = {
    DistributionAlias      = var.domain_name
    CloudFrontCertArn      = aws_cloudformation_stack.certificate_stack_virginia.outputs["CertificateARN"]
    AddWWWPrefix           = false # not sure on this one? Think the cert will need to cover that subdomain
    FraudHeaderEnabled     = true  # TODO: Consider this?
    EnableCustomErrorPages = false # TODO: and this?
    LoadbalancerDnsName    = var.load_balancer_dns_name
    VpcOriginId            = aws_cloudformation_stack.vpc_origin_stack.outputs["VpcOriginId"]
  }
  template_body = file("./templates/cloudfront-template.yaml") # TODO: Swap this back to the dev-platform template when VPC origins are supported: https://github.com/govuk-one-login/devplatform-deploy/tree/main/cloudfront-distribution
  capabilities  = ["CAPABILITY_NAMED_IAM", "CAPABILITY_AUTO_EXPAND"]
  depends_on    = [aws_cloudformation_stack.certificate_stack_virginia]

  tags = merge({
    Product     = var.product
    System      = var.system
    Environment = var.environment
    Owner       = var.owner_email
  }, var.additional_cloudfront_tags)
}

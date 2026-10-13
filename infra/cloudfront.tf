resource "aws_cloudformation_stack" "cloudfront_distribution" {
  name         = "cloudfront-distribution"
  template_url = "https://template-storage-templatebucket-1upzyw6v9cs42.s3.amazonaws.com/cloudfront-distribution/template-${var.cloudfront_stack_version}.yaml"
  parameters = {
    DistributionAlias                                             = var.domain_name
    CloudFrontCertArn                                             = aws_cloudformation_stack.certificate_stack_virginia.outputs["CertificateARN"]
    AddWWWPrefix                                                  = false # not sure on this one? Think the cert will need to cover that subdomain
    FraudHeaderEnabled                                            = true  # TODO: Consider this?
    EnableCustomErrorPages                                        = false # TODO: and this?
    UseVpcOrigin                                                  = true
    VpcOriginEndpointConfigArn                                    = var.load_balancer_arn,
    VpcOriginVpcId                                                = aws_cloudformation_stack.spoke_vpc_stack.outputs["VpcId"]
    CloudfrontDistributionOriginsDomainName                       = var.load_balancer_dns_name,
    OriginCloakingHeader                                          = "none",
    PreviousOriginCloakingHeader                                  = "none",
    OriginCloakingHeaderManagedSecretRotationMonthWeekDaySchedule = "THU#1", # pragma: allowlist secret
    LogDestination                                                = "none"
  }
  capabilities = ["CAPABILITY_NAMED_IAM", "CAPABILITY_AUTO_EXPAND"]
  depends_on   = [aws_cloudformation_stack.certificate_stack_virginia]

  tags = merge({
    Product     = var.product
    System      = var.system
    Environment = var.environment
    Owner       = var.owner_email
  }, var.additional_cloudfront_tags)
}

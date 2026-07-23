resource "aws_cloudformation_stack" "cloudfront_distribution" {
  name = "cloudfront-distribution"
  parameters = {
    DistributionAlias                     = var.domain_name
    CloudFrontCertArn                     = aws_cloudformation_stack.certificate_stack_virginia.outputs["CertificateARN"]
    AddWWWPrefix                          = false # not sure on this one? Think the cert will need to cover that subdomain
    FraudHeaderEnabled                    = true  # TODO: Consider this?
    EnableCustomErrorPages                = false # TODO: and this?
    PrivateLoadApplicationLoadBalancerArn = "arn:aws:elasticloadbalancing:eu-west-2:092201263203:loadbalancer/app/dev-rp-Appli-cXHRMY70iGmY/7abab270636ace03"
    LoadbalancerDnsName                   = "internal-dev-rp-Appli-cXHRMY70iGmY-367905448.eu-west-2.elb.amazonaws.com"
    DeployVpcOrign                        = true
    VpcId                                 = aws_cloudformation_stack.spoke_vpc_stack.outputs["VpcId"]
  }
  template_body = file("./templates/cloudfront-template.yaml")
  capabilities  = ["CAPABILITY_NAMED_IAM", "CAPABILITY_AUTO_EXPAND"]
  depends_on    = [aws_cloudformation_stack.certificate_stack_virginia]

  tags = merge({
    Product     = var.product
    System      = var.system
    Environment = var.environment
    Owner       = var.owner_email
  }, var.additional_cloudfront_tags)
}

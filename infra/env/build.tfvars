environment                    = "build"
create_build_stacks            = true
container_signer_kms_key_arn   = "arn:aws:kms:eu-west-2:717728193008:key/f7e17fde-deef-4740-b68b-1f79831db628"
signer_allowed_accounts        = ["605893375401", "056449378648", "735910966883"]
transit_gateway_hub_account_id = "731493186013"
transit_gateway_id             = "tgw-06493a63242d7fa50"
transit_gateway_ipam_pool      = "Build"
allowed_promotion_accounts     = ["605893375401"]
domain_name                    = "manage.build.sign-in.service.gov.uk"
load_balancer_arn              = "arn:aws:elasticloadbalancing:eu-west-2:717728193008:loadbalancer/app/build--Appli-hEJhsMyfS3fy/e95e3fa2fa000b18"
load_balancer_dns_name         = "internal-build--Appli-hEJhsMyfS3fy-2080051235.eu-west-2.elb.amazonaws.com"

additional_cloudfront_tags = {
  FMSGlobalCustomPolicy = "true"
}

environment                    = "dev"
create_build_stacks            = true
container_signer_kms_key_arn   = "arn:aws:kms:eu-west-2:092201263203:key/65c6eb9e-89dc-4346-958a-af288b1ba6f7"
signer_allowed_accounts        = []
transit_gateway_hub_account_id = "796973488515"
transit_gateway_id             = "tgw-037ccd82182b7d1da"
transit_gateway_ipam_pool      = "Development"
allowed_promotion_accounts     = []
domain_name                    = "manage.development.sign-in.service.gov.uk"
load_balancer_arn              = "arn:aws:elasticloadbalancing:eu-west-2:092201263203:loadbalancer/app/dev-rp-Appli-cXHRMY70iGmY/7abab270636ace03"
load_balancer_dns_name         = "internal-dev-rp-Appli-cXHRMY70iGmY-367905448.eu-west-2.elb.amazonaws.com"
additional_cloudfront_tags = {
  FMSGlobalCustomPolicy = "true"
}

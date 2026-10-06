environment                    = "dev"
create_build_stacks            = true
container_signer_kms_key_arn   = "arn:aws:kms:eu-west-2:092201263203:key/65c6eb9e-89dc-4346-958a-af288b1ba6f7"
signer_allowed_accounts        = []
transit_gateway_hub_account_id = "796973488515"
allowed_promotion_accounts     = []
domain_name                    = "manage.development.sign-in.service.gov.uk"
load_balancer_arn              = "arn:aws:elasticloadbalancing:eu-west-2:092201263203:loadbalancer/app/dev-rp-Appli-cXHRMY70iGmY/7abab270636ace03"
load_balancer_dns_name         = "internal-dev-rp-Appli-cXHRMY70iGmY-367905448.eu-west-2.elb.amazonaws.com"
additional_cloudfront_tags = {
  FMSGlobalCustomPolicy = "true"
}

# Stack version pinning
build_notification_stack_version       = "v2.10.0"
certificate_stack_version              = "v1.1.7"
ecr_scan_logger_stack_version          = "v1.2.8"
ecr_stack_version                      = "v3.2.5"
test_image_repository_stack_version    = "v1.4.4"
github_identity_provider_stack_version = "v1.1.7"
pipeline_stack_version                 = "v2.121.0"
container_signer_stack_version         = "v1.1.8"
transit_gateway_role_stack_version     = "v2.0.2"
vpc_stack_version                      = "v4.0.0"

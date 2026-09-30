variable "environment" {
  type        = string
  description = "The environment name"
  validation {
    condition     = contains(["dev", "build", "staging", "integration", "production"], var.environment)
    error_message = "Valid values for var: environment are (dev, build, staging, integration, production)"
  }
}

variable "create_build_stacks" {
  type        = bool
  description = "Whether or not to deploy the stacks for building and signing application code. Only needed in dev and build. Defaults to false"
  default     = false
}

variable "container_signer_kms_key_arn" {
  description = "Container signer KMS key ARN - get from build account container-signer stack after pipeline deployment"
  type        = string
}

variable "system" {
  type        = string
  description = "The name of the system. Used in tags."
  default     = "RP Service Management"
}

variable "product" {
  type        = string
  description = "The name of the product. Used in tags."
  default     = "GOV.UK One Login"
}

variable "owner_email" {
  type        = string
  description = "The owning team's Google Group email address. Used for tagging and ECR scan notifications"
  default     = "di-orchestration@digital.cabinet-office.gov.uk"
}

variable "repository_name" {
  type        = string
  description = "The Github repository name"
  default     = "relying-party-admin-tool"
}

variable "signer_allowed_accounts" {
  type        = list(string)
  description = "The AWS account IDs that can read the code signing KMS key"
}

variable "allowed_promotion_accounts" {
  type        = list(string)
  description = "The AWS account IDs that this pipeline will promote to. Maximum 2 accounts"
  default     = []
}

variable "transit_gateway_hub_account_id" {
  type        = string
  description = "The account ID of the account containing the Transit Gateway hub"
}

variable "transit_gateway_hub_dr_account_id" {
  type        = string
  description = "The account ID of the account containing the disaster recovery Transit Gateway hub. Should only be set in production or in accounts where we're testing a DR scenario"
  # This default matches the default value in the Transit Gateway Cross account role template
  default = "none"
}

variable "use_dr_transit_gateway" {
  type        = bool
  description = "A flag which allows us to send our egress via the disaster recovery transit gateway instead of the normal one. Should only be set in production AND if the main transit gateway is unavailable."
  default     = false
}
variable "domain_name" {
  type        = string
  description = "Domain of the application"
}
variable "additional_cloudfront_tags" {
  type        = map(string)
  description = "A map of additional tags to apply to the Cloudfront stack"
  default     = {}
}
variable "load_balancer_arn" {
  type        = string
  description = "ARN of the private application load balancer to use to create a VPC origin"
}
variable "load_balancer_dns_name" {
  type        = string
  description = "DNS name of private application load balancer to target as Cloudfront origin"
}

variable "build_notification_stack_version" {
  type        = string
  description = "Version number of the build notification stack to use. Must be a semantic version formatted like the following: v2.7.1"
}

variable "certificate_stack_version" {
  type        = string
  description = "Version number of the certificate stack to use. Must be a semantic version formatted like the following: v2.7.1"
}

variable "ecr_scan_logger_stack_version" {
  type        = string
  description = "Version number of the ecr scan logger stack to use. Must be a semantic version formatted like the following: v2.7.1"
}

variable "ecr_stack_version" {
  type        = string
  description = "Version number of the ecr scan logger stack to use. Must be a semantic version formatted like the following: v2.7.1"
}

variable "test_image_repository_stack_version" {
  type        = string
  description = "Version number of the ecr stack to use. Must be a semantic version formatted like the following: v2.7.1"
}

variable "github_identity_provider_stack_version" {
  type        = string
  description = "Version number of the github identity provider stack to use. Must be a semantic version formatted like the following: v2.7.1"
}


variable "pipeline_stack_version" {
  type        = string
  description = "Version number of the sam deploy pipeline stack to use. Must be a semantic version formatted like the following: v2.7.1"
}

variable "container_signer_stack_version" {
  type        = string
  description = "Version number of the container signer stack to use. Must be a semantic version formatted like the following: v2.7.1"
}

variable "transit_gateway_role_stack_version" {
  type        = string
  description = "Version number of the transit gateway role stack to use. Must be a semantic version formatted like the following: v2.7.1"
}

variable "vpc_stack_version" {
  type        = string
  description = "Version number of the vpc stack to use. Must be a semantic version formatted like the following: v2.7.1"
}

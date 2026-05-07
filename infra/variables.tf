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
variable "transit_gateway_id" {
  type        = string
  description = "The ID of the transit gateway we will attach our spoke VPC to"
  default     = "None"
}

variable "transit_gateway_dr_id" {
  type        = string
  description = "The ID of the disaster recovery transit gateway we can attach our VPC to in the case the main one becomes unavailable. Should only be set in production environments."
  default     = "None"
}

variable "use_dr_transit_gateway" {
  type        = bool
  description = "A flag which allows us to send our egress via the disaster recovery transit gateway instead of the normal one. Should only be set in production AND if the main transit gateway is unavailable."
  default     = false
}

variable "transit_gateway_ipam_pool" {
  type        = string
  description = "Select the pool of IP addresses you want an allocation from for this VPC. This is managed in the transit gateway IPAM."
  validation {
    condition     = contains(["Development", "Build", "Staging", "Integration", "Production"], var.transit_gateway_ipam_pool)
    error_message = "Valid values for the IPAM pool are: (Development, Build, Staging, Integration, Production)"
  }
}

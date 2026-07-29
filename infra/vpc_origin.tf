resource "aws_cloudformation_stack" "vpc_origin_stack" {
  name = "vpc-origin"
  parameters = {
    PrivateLoadApplicationLoadBalancerArn = "arn:aws:elasticloadbalancing:eu-west-2:092201263203:loadbalancer/app/dev-rp-Appli-cXHRMY70iGmY/7abab270636ace03"
    VpcId                                 = aws_cloudformation_stack.spoke_vpc_stack.outputs["VpcId"]
  }
  template_body = file("./templates/vpc-origin-template.yaml")
  capabilities  = ["CAPABILITY_NAMED_IAM", "CAPABILITY_AUTO_EXPAND"]

}

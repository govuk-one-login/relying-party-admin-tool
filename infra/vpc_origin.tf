resource "aws_cloudformation_stack" "vpc_origin_stack" {
  name = "vpc-origin"
  parameters = {
    PrivateLoadApplicationLoadBalancerArn = var.load_balancer_arn
    VpcId                                 = aws_cloudformation_stack.spoke_vpc_stack.outputs["VpcId"]
  }
  template_body = file("./templates/vpc-origin-template.yaml")
  capabilities  = ["CAPABILITY_NAMED_IAM", "CAPABILITY_AUTO_EXPAND"]

}

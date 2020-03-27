//resource "aws_acm_certificate" "main" {
//  tags = { project_name = var.project_name }
//  provider = aws.acm
//
//  domain_name = "*.${var.domain_name}"
//  validation_method = "DNS"
//  subject_alternative_names = [var.domain_name]
//}
//
//resource "aws_route53_record" "main_cert_validation" {
//  provider = aws.acm
//
//  name    = aws_acm_certificate.main.domain_validation_options.0.resource_record_name
//  ttl     = 60
//  type    = aws_acm_certificate.main.domain_validation_options.0.resource_record_type
//  zone_id = var.hosted_zone
//  records = [
//    aws_acm_certificate.main.domain_validation_options.0.resource_record_value
//  ]
//}
//
//resource "aws_acm_certificate_validation" "main" {
//  provider = aws.acm
//
//  certificate_arn = aws_acm_certificate.main.arn
//  validation_record_fqdns = [aws_route53_record.main_cert_validation.fqdn]
//}

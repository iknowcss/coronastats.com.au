resource "aws_acm_certificate" "main_legacy" {
  tags = { project_name = var.project_name }
  provider = aws.acm

  domain_name = "*.coronastatsau.com"
  validation_method = "DNS"
  subject_alternative_names = ["coronastatsau.com"]
}

resource "aws_route53_record" "main_cert_validation_legacy" {
  provider = aws.acm

  name    = aws_acm_certificate.main_legacy.domain_validation_options.0.resource_record_name
  ttl     = 60
  type    = aws_acm_certificate.main_legacy.domain_validation_options.0.resource_record_type
  zone_id = "Z060389321W4PQX5JO7L0"
  records = [
    aws_acm_certificate.main_legacy.domain_validation_options.0.resource_record_value
  ]
}

resource "aws_acm_certificate_validation" "main_legacy" {
  provider = aws.acm

  certificate_arn = aws_acm_certificate.main_legacy.arn
  validation_record_fqdns = [aws_route53_record.main_cert_validation_legacy.fqdn]
}

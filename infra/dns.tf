resource "aws_route53_record" "primary_a_record" {
  zone_id = var.hosted_zone
  name = var.domain_name
  type = "A"

  alias {
    name = aws_cloudfront_distribution.www_distribution.domain_name
    zone_id = aws_cloudfront_distribution.www_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www_a_record" {
  zone_id = var.hosted_zone
  name = "www.${var.domain_name}"
  type = "A"

  alias {
    name = aws_cloudfront_distribution.www_distribution.domain_name
    zone_id = aws_cloudfront_distribution.www_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

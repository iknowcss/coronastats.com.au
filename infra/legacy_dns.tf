resource "aws_route53_record" "primary_a_record_legacy" {
  zone_id = "Z060389321W4PQX5JO7L0"
  name = "coronastatsau.com"
  type = "A"

  alias {
    name = aws_cloudfront_distribution.www_distribution_legacy.domain_name
    zone_id = aws_cloudfront_distribution.www_distribution_legacy.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www_a_record_legacy" {
  zone_id = "Z060389321W4PQX5JO7L0"
  name = "www.coronastatsau.com"
  type = "A"

  alias {
    name = aws_cloudfront_distribution.www_distribution_legacy.domain_name
    zone_id = aws_cloudfront_distribution.www_distribution_legacy.hosted_zone_id
    evaluate_target_health = false
  }
}

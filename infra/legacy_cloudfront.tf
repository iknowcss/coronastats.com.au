resource "aws_cloudfront_distribution" "www_distribution_legacy" {
  tags = { project_name = var.project_name }
  enabled             = true
  default_root_object = "index.html"
  aliases = ["coronastatsau.com", "www.coronastatsau.com"]
  depends_on = [aws_acm_certificate_validation.main_legacy]

  origin {
    custom_origin_config {
      http_port              = "80"
      https_port             = "443"
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1", "TLSv1.1", "TLSv1.2"]
    }

    domain_name = aws_s3_bucket.website_bucket_legacy.website_endpoint
    origin_id   = "coronastatsau.com"
  }

  default_cache_behavior {
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "coronastatsau.com"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }


  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.main_legacy.arn
    ssl_support_method  = "sni-only"
  }
}

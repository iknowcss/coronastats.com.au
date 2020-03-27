//resource "aws_cloudfront_distribution" "www_distribution" {
//  tags = { project_name = var.project_name }
//  enabled             = true
//  default_root_object = "index.html"
//  aliases = [var.domain_name, "www.${var.domain_name}"]
//  depends_on = [aws_acm_certificate_validation.main]
//
//  origin {
//    custom_origin_config {
//      http_port              = "80"
//      https_port             = "443"
//      origin_protocol_policy = "http-only"
//      origin_ssl_protocols   = ["TLSv1", "TLSv1.1", "TLSv1.2"]
//    }
//
//    domain_name = aws_s3_bucket.website_bucket.website_endpoint
//    origin_id   = var.domain_name
//  }
//
//  default_cache_behavior {
//    viewer_protocol_policy = "redirect-to-https"
//    compress               = true
//    allowed_methods        = ["GET", "HEAD"]
//    cached_methods         = ["GET", "HEAD"]
//    target_origin_id       = var.domain_name
//
//    forwarded_values {
//      query_string = false
//      cookies {
//        forward = "none"
//      }
//    }
//  }
//
//
//  restrictions {
//    geo_restriction {
//      restriction_type = "none"
//    }
//  }
//
//  viewer_certificate {
//    acm_certificate_arn = aws_acm_certificate.main.arn
//    ssl_support_method  = "sni-only"
//  }
//}

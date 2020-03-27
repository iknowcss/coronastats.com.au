resource "aws_s3_bucket" "website_bucket_legacy" {
  tags = { project_name = var.project_name }
  bucket = "coronastatsau.com"
  acl    = "public-read"

  website {
    redirect_all_requests_to = "https://coronaforecast.com.au"
  }
}

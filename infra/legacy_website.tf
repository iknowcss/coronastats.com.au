resource "aws_s3_bucket" "website_bucket_legacy" {
  tags = { project_name = var.project_name }
  bucket = "coronastatsau.com"
  acl    = "public-read"
  policy = <<EOF
{
  "Version": "2008-10-17",
  "Statement": [
    {
      "Sid": "PublicReadForGetBucketObjects",
      "Effect": "Allow",
      "Principal": { "AWS": "*" },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::coronastatsau.com/*"
    }
  ]
}
EOF

  website {
    index_document = "index.html"
    error_document = "error.html"
  }

  versioning {
    enabled = true
  }
}

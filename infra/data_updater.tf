resource "aws_lambda_function" "data_updater" {
  function_name = "${var.project_name_safe}_data_updater"
  tags = { project_name = var.project_name }

  filename = var.data_updater_source_code_path
  source_code_hash = filebase64sha256(var.data_updater_source_code_path)
  handler = "doh_data_ingest.lambda_handler"
  runtime = "python3.7"
  memory_size = 128
  timeout = 10
  role = aws_iam_role.data_updater.arn

//  environment {
//    variables = {
//      AWS_KINESIS_STREAM_NAME = aws_kinesis_stream.change_api_stream.name
//    }
//  }
}

resource "aws_iam_role" "data_updater" {
  name = "${var.project_name_safe}_data_updater"
  tags = { project_name = var.project_name }

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": { "Service": "lambda.amazonaws.com" },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

# - Write to Website Bucket --------------------------------------------------------------------------------------------

resource "aws_cloudwatch_event_rule" "data_update_schedule" {
  name                = "${var.project_name_safe}_data_update_schedule"
  description         = "Schedule to run the data-updater lambda"
  schedule_expression = "cron(0/15 * * * ? *)" # Every 15th minute (:00, :15, :45)
}

resource "aws_cloudwatch_event_target" "check_foo_every_one_minute" {
  rule      = aws_cloudwatch_event_rule.data_update_schedule.name
  target_id = "lambda"
  arn       = aws_lambda_function.data_updater.arn
}

resource "aws_lambda_permission" "cloudwatch_call_data_updater" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.data_updater.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.data_update_schedule.arn
}

# - Write to Website Bucket --------------------------------------------------------------------------------------------

resource "aws_iam_policy" "write_to_website_bucket" {
  name = "${var.project_name_safe}_data_updater_write_to_s3"
  description = "Kinesis write-only access policy"
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "${aws_s3_bucket.website_bucket.arn}/*",
      "Effect": "Allow"
    }
  ]
}
EOF
}

data "aws_iam_policy_document" "write_to_website_bucket" {
  statement {
    actions = [
      "s3:PutObject",
      "s3:GetObject",
    ]
    resources = [aws_s3_bucket.website_bucket.arn]
  }
}

resource "aws_iam_role_policy_attachment" "data_updater_write_to_website_bucket" {
  role       = aws_iam_role.data_updater.name
  policy_arn = aws_iam_policy.write_to_website_bucket.arn
}

# - Write to CloudWatch logs -------------------------------------------------------------------------------------------

resource "aws_cloudwatch_log_group" "data_updater" {
  name = "/aws/lambda/${aws_lambda_function.data_updater.function_name}"
  tags = { project_name = var.project_name }
  retention_in_days = 7
}

resource "aws_iam_policy" "write_data_updater_logs" {
  name = "${var.project_name_safe}_data_updater_write_logs"
  description = ""
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "${aws_cloudwatch_log_group.data_updater.arn}:*",
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "data_updater_write_data_updater_logs" {
  role       = aws_iam_role.data_updater.name
  policy_arn = aws_iam_policy.write_data_updater_logs.arn
}

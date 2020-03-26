terraform {
  backend "s3" {
    bucket = "iknowcss-terraform-state"
    key = "project/coronastatus.com.au/main.tfstate"
    region = "ap-southeast-2"
  }
}

provider "aws" {
  version = "~> 2.53.0"
  region = "ap-southeast-2"
}

provider "aws" {
  alias = "acm"
  version = "~> 2.53.0"
  region = "us-east-1"
}
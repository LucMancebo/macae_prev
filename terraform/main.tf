terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Backend remoto — S3 + DynamoDB para lock
  backend "s3" {
    bucket         = "macaeprev-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "MACAEPREV"
      Environment = var.environment
      ManagedBy   = "Terraform"
      CreatedAt   = timestamp()
    }
  }
}

# VPC Module
module "vpc" {
  source = "./modules/vpc"

  environment         = var.environment
  vpc_cidr            = var.vpc_cidr
  public_subnets     = var.public_subnets
  private_subnets    = var.private_subnets
  azs                 = var.azs
}

# RDS Module (PostgreSQL)
module "rds" {
  source = "./modules/rds"

  environment              = var.environment
  db_instance_class        = var.db_instance_class
  allocated_storage        = var.allocated_storage
  db_name                  = var.db_name
  db_username              = var.db_username
  db_password              = var.db_password  # Use AWS Secrets Manager in production
  vpc_id                   = module.vpc.vpc_id
  private_subnet_ids       = module.vpc.private_subnet_ids
  allowed_security_groups  = [module.ecs.ecs_security_group_id]
  backup_retention_days    = var.backup_retention_days
  multi_az                 = var.multi_az_enabled
}

# ECR Module (Docker repositories)
module "ecr" {
  source = "./modules/ecr"

  environment = var.environment
  images      = ["macaeprev-api", "macaeprev-web"]
}

# ECS Module (Fargate cluster)
module "ecs" {
  source = "./modules/ecs"

  environment              = var.environment
  cluster_name             = "macaeprev-${var.environment}"
  vpc_id                   = module.vpc.vpc_id
  private_subnet_ids       = module.vpc.private_subnet_ids
  api_image_uri            = "${module.ecr.registry_url}/macaeprev-api:latest"
  web_image_uri            = "${module.ecr.registry_url}/macaeprev-web:latest"
  database_url             = module.rds.database_url
  api_port                 = 3333
  web_port                 = 3000
  task_cpu                 = var.task_cpu
  task_memory              = var.task_memory
  api_desired_count        = var.api_desired_count
  web_desired_count        = var.web_desired_count
}

# ALB Module (Application Load Balancer)
module "alb" {
  source = "./modules/alb"

  environment              = var.environment
  vpc_id                   = module.vpc.vpc_id
  public_subnet_ids        = module.vpc.public_subnet_ids
  api_target_group_arn     = module.ecs.api_target_group_arn
  web_target_group_arn     = module.ecs.web_target_group_arn
}

# S3 Module (File storage and uploads)
module "s3" {
  source = "./modules/s3"

  environment = var.environment
  buckets = {
    files    = "macaeprev-${var.environment}-files"
    uploads  = "macaeprev-${var.environment}-uploads"
    logs     = "macaeprev-${var.environment}-logs"
  }
  enable_versioning = true
  enable_logging    = true
}

# CloudFront Module (CDN)
module "cloudfront" {
  source = "./modules/cloudfront"

  environment = var.environment
  alb_domain  = module.alb.alb_dns_name
  s3_domain   = module.s3.files_bucket_regional_domain
}

# IAM Module (Roles and policies)
module "iam" {
  source = "./modules/iam"

  environment          = var.environment
  ecs_task_execution_role = module.ecs.task_execution_role_arn
  s3_bucket_arns      = [
    module.s3.files_bucket_arn,
    module.s3.uploads_bucket_arn
  ]
  ecr_repository_arns = module.ecr.repository_arns
}

variable "gcp_project_id" {
  description = "GCP project ID"
  type        = string
}

variable "gcp_region" {
  description = "GCP region"
  type        = string
  default     = "asia-northeast1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "kskphotos"
}

# --- Cloud Run ---
variable "cloud_run_cpu" {
  description = "Cloud Run CPU (e.g. '1' = 1 vCPU)"
  type        = string
  default     = "1"
}

variable "cloud_run_memory" {
  description = "Cloud Run memory (e.g. '512Mi')"
  type        = string
  default     = "512Mi"
}

variable "cloud_run_max_instances" {
  description = "Cloud Run maximum instances"
  type        = number
  default     = 2
}

variable "cloud_run_min_instances" {
  description = "Cloud Run minimum instances (0 = scale to zero)"
  type        = number
  default     = 0
}

variable "container_port" {
  description = "Container port"
  type        = number
  default     = 8080
}

# --- Cloud SQL (外部管理 — 接続情報のみ) ---
variable "database_url_secret_id" {
  description = "Secret Manager secret ID for DATABASE_URL"
  type        = string
  default     = "kskphotos-database-url"
}

# --- Domain ---
variable "domain" {
  description = "Custom domain (optional)"
  type        = string
  default     = ""
}

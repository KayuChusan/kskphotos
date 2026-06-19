variable "project_id" {
  type = string
}

variable "project_name" {
  type = string
}

variable "region" {
  type = string
}

variable "image" {
  description = "Container image URL"
  type        = string
}

variable "service_account" {
  description = "Service account email for Cloud Run"
  type        = string
}

variable "cpu" {
  type    = string
  default = "1"
}

variable "memory" {
  type    = string
  default = "512Mi"
}

variable "max_instances" {
  type    = number
  default = 2
}

variable "min_instances" {
  type    = number
  default = 0
}

variable "container_port" {
  type    = number
  default = 8080
}

variable "env_vars" {
  description = "Environment variables"
  type        = map(string)
  default     = {}
}

variable "secret_env_vars" {
  description = "Secret Manager references (key = env var name, value = secret ID)"
  type        = map(string)
  default     = {}
}

variable "cloudsql_connection_name" {
  description = "Cloud SQL connection name (project:region:instance). Empty = no Cloud SQL mount"
  type        = string
  default     = ""
}

variable "domain" {
  description = "Custom domain to map to this service (empty = no mapping)"
  type        = string
  default     = ""
}

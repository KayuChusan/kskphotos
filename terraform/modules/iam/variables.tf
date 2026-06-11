variable "project_id" {
  type = string
}

variable "project_name" {
  type = string
}

variable "github_repo" {
  description = "GitHub repository (owner/repo) for Workload Identity Federation"
  type        = string
}

variable "database_url_secret_id" {
  description = "Secret Manager secret ID for DATABASE_URL (CI ビルド時に参照)"
  type        = string
}

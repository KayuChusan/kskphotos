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

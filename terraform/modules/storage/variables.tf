variable "project_name" {
  type = string
}

variable "region" {
  type = string
}

variable "cloud_run_sa" {
  description = "Cloud Run service account email (granted read/write access)"
  type        = string
}

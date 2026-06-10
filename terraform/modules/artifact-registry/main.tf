resource "google_artifact_registry_repository" "app" {
  location      = var.region
  repository_id = var.project_name
  format        = "DOCKER"
  description   = "${var.project_name} container images"

  cleanup_policies {
    id     = "keep-recent"
    action = "KEEP"

    most_recent_versions {
      keep_count = 5
    }
  }

  cleanup_policies {
    id     = "delete-old-untagged"
    action = "DELETE"

    condition {
      tag_state  = "UNTAGGED"
      older_than = "604800s"
    }
  }
}

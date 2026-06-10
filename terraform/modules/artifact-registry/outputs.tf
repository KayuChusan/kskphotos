output "repository_url" {
  description = "Artifact Registry repository URL"
  value       = "${var.region}-docker.pkg.dev/${google_artifact_registry_repository.app.project}/${google_artifact_registry_repository.app.repository_id}"
}

output "repository_id" {
  description = "Artifact Registry repository ID"
  value       = google_artifact_registry_repository.app.repository_id
}

output "cloud_run_sa_email" {
  description = "Cloud Run service account email"
  value       = google_service_account.cloud_run.email
}

output "cicd_sa_email" {
  description = "CI/CD service account email"
  value       = google_service_account.cicd.email
}

output "wif_provider_name" {
  description = "Workload Identity Federation provider name (for GitHub Actions)"
  value       = google_iam_workload_identity_pool_provider.github.name
}

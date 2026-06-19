output "cloud_run_url" {
  description = "Cloud Run service URL"
  value       = module.cloud_run.service_url
}

output "artifact_registry_url" {
  description = "Artifact Registry repository URL"
  value       = module.artifact_registry.repository_url
}

output "storage_bucket_name" {
  description = "Cloud Storage bucket name for photos"
  value       = module.storage.bucket_name
}

output "cdn_url" {
  description = "CDN URL for photo delivery"
  value       = module.storage.cdn_url
}

output "cloud_run_service_account" {
  description = "Cloud Run service account email"
  value       = module.iam.cloud_run_sa_email
}

output "github_wif_provider" {
  description = "Workload Identity Federation provider for GitHub Actions"
  value       = module.iam.wif_provider_name
}

output "github_wif_service_account" {
  description = "Service account for GitHub Actions CI/CD"
  value       = module.iam.cicd_sa_email
}

output "domain_mapping_records" {
  description = "独自ドメインの DNS に設定するレコード(apex の A/AAAA)。apply 後に確認"
  value       = module.cloud_run.domain_mapping_records
}

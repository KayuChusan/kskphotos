output "service_url" {
  description = "Cloud Run service URL"
  value       = google_cloud_run_v2_service.app.uri
}

output "service_name" {
  description = "Cloud Run service name"
  value       = google_cloud_run_v2_service.app.name
}

output "domain_mapping_records" {
  description = "Custom domain の DNS に設定するレコード(apex は A/AAAA)。domain 未指定時は null"
  value = (
    var.domain != ""
    ? google_cloud_run_domain_mapping.app[0].status[0].resource_records
    : null
  )
}
